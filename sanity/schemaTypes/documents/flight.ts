import { CalendarIcon } from "@sanity/icons/Calendar"
import { Rubik_Lines } from "next/font/google"
import { defineArrayMember, defineField, defineType } from "sanity"

type FareLike = {
  cabinClass?: string
  capacity?: number
  remainingSeats?: number
}

type SeatLike = { 
  seatCode?: string
  cabinClass?: string
  row?: number
}

const EXPECTED_CABIN_COUNTS: Record<string, number> = {
  first: 8,
  business: 20,
  economy: 108
}

export const flight = defineType({
  name: "flight",
  title: "Flight",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "sourceKey",
      title: "Schedule source key",
      type: "string",
      readOnly: ({ document }) => Boolean(document?.openedForSaleAt),
      validation: rule => rule.required()
    }),
    defineField({
      name: "flightNumber",
      title: "Flight number",
      type: "string",
      validation: rule => rule.required().regex(/^[A-Z]{2}\d{2, 4}$/)
    }),
    defineField({
      name: "origin",
      title: "Origin",
      type: "reference",
      to: [{ type: "airport" }],
      validation: rule => rule.required()
    }),
    defineField({
      name: "destination",
      title: "Destination",
      type: "reference",
      to: [{ type: "airport" }],
      validation: rule => rule.required()
    }),
    defineField({
      name: "departureAt",
      title: "Departure time (UTC)",
      type: "datetime",
      validation: rule => rule.required()
    }),
    defineField({
      name: "arrivalAt",
      title: "Arrival time (UTC)",
      type: "datetime",
      validation: rule => 
        rule.required().custom((value, context) => {
          const departureAt = context.document?.departureAt as
            string | undefined
          return departureAt &&
            value &&
            new Date(value) <= new Date(departureAt)
            ? "Arrival must be after departure"
            : true
        })
    }),
    defineField({
      name: "durationMinutes",
      title: "Scheduled duration (minutes)",
      type: "number",
      description: "Whole scheduled minutes derived from the UTC departure and arrival times.",
      validation: rule => rule.required().integer().min(1)
    }),
    defineField({
      name: "departureLocalDate",
      title: "Origin-local departure date",
      type: "date",
      validation: rule => rule.required()
    }),
    defineField({
      name: "departureLocalTime",
      title: "Origin-local departure time",
      type: "string",
      description: "24-hour HH:mm value in the origin airport timezone. Used for exact concierge time filtering.",
      readOnly: ({ document }) => Boolean(document?.openedForSaleAt),
      validation: rule => 
        rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "24-hour time",
          invert: false
        })
    }),
    defineField({
      name: "arrivalLocalDate",
      title: "Destination-local arrival date",
      type: "date",
      validation: rule => rule.required()
    }),
    defineField({
      name: "arrivalLocalTime",
      title: "Destination-local arrival time",
      type: "string",
      description: "24-hour HH:mm value in the destination airport timezone. Used for itinerary display and validation.",
      readOnly: ({ document }) => Boolean(document?.openedForSaleAt),
      validation: rule => 
        rule.required().regex(/^([01]\d|2[0-3])[0-5]\d$/, {
          name: "24-hour time",
          invert: false
        })
    }),
    defineField({
      name: "aircraft",
      title: "Aircraft template",
      type: "reference",
      to: [{ type: "aircraftTemplate" }],
      readOnly: ({ document }) => 
        document?.salesStatus === "open" || Boolean(document?.openForSaleAt),
      validation: rule => rule.required()
    }),
    defineField({
      name: "farePolicy",
      title: "Fare policy",
      type: "reference",
      to: [{ type: "farePolicy" }],
      validation: rule => rule.required()
    }),
    defineField({
      name: "salesStatus",
      title: "Sales status",
      type: "string",
      description: "Use the Open for sale document action to initiatize inventory. Open cannot be selected directly.",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Closed", value: "closed" }
        ],
        layout: "radio"
      },
      validation: rule => 
        rule.required().custom((value, context) => {
          const openedForSaleAt = context.document?.openedForSaleAt
          if (value === "open" && !openedForSaleAt) {
            return "Use the Open for sale action to create the immutable seat inventory."
          }
          if (openedForSaleAt && value === "draft") {
            return "An opened flight canot return to draft sales status."
          }
          return true
        })
    }),
    defineField({
      name: "operationalStatus",
      title: "Operational status",
      type: "string",
      options: {
        list: [
          { title: "Scheduled", value: "scheduled" },
          { title: "Delayed", value: "delayed" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Departed", value: "departed" }
        ],
        layout: "radio"
      },
      validation: rule => rule.required()
    }),
    defineField({
      name: "cabinFares",
      title: "Cabin fares",
      type: "array",
      of: [defineArrayMember({ type: "flightCabinFare" })],
      validation: rule =>
        rule
          .required()
          .length(3)
          .custom(value => {
            const fares = (value ?? []) as FareLike[]
            const cabins = fares.map(fare => fare.cabinClass)
            if (new Set(cabins).size !== cabins.length) {
              return "Each cabin class may appear only once."
            }
            for (const [cabinClass, expectedCapacity] of Object.entries(
              EXPECTED_CABIN_COUNTS
            )) {
              const fare = fares.find(item => item.cabinClass === cabinClass)
              if (!fare) {
                return `Missing ${cabinClass} fare.`
              }
              if (fare.capacity !== expectedCapacity) {
                return `${cabinClass} capacity must be ${expectedCapacity}.`
              }
              if ((fare.remainingSeats ?? 0) > (fare.capacity ?? 0)) {
                return "Remaining seats cannot exceed capacity."
              }
            }
            return true
          })
    }),
    defineField({
      name: "seatLayoutSnapshot",
      title: "Immutable seat-layout snapshot",
      description: "Captured when the flight opens for sale. This is the complete seat source; missing sparse seat-claim documents mean available.",
      type: "array",
      readOnly: ({ document }) => 
        document?.salesStatus === "open" || Boolean(document?.openedForSaleAt),
      of: [defineArrayMember({ type: "aircraftSeat" })],
      validation: rule =>
        rule
          .required()
          .length(136)
          .custom(value => {
            const seats = (value ?? []) as SeatLike[]
            const codes = seats.map(seat => seat.seatCode).filter(Boolean)
            if (new Set(codes).size !== codes.length) {
              return "Seat codes must be unique on a flight."
            }
            for (const [cabinClass, expected] of Object.entries(
              EXPECTED_CABIN_COUNTS
            )) {
              if (seats.filter(seat => seat.cabinClass === cabinClass).length !== expected) {
                return `${cabinClass} must contain ${expected} seats.`
              }
            }
            const rows = seats.map(seat => seat.row ?? 0)
            if (rows.some((row, index) => index > 0 && row < rows[index - 1])) {
              return "Seats must stay ordered front-to-back by row."
            }
            return true
          })
     }),
     defineField({
      name: "inventoryRevision",
      title: "Inventory revision",
      type: "string",
      readOnly: ({ document }) => Boolean(document?.openedForSaleAt),
      validation: rule => rule.required()
     }),
     defineField({
      name: "openedForSaleAt",
      title: "Opened for sale at",
      type: "datetime",
      readOnly: true
     })
  ],
  validation: rule => 
    rule.custom(document => {
      const origin = document?.origin as { _ref?: string } | undefined
      const destination = document?.destination as
        { _ref?: string } | undefined
      return origin?._ref && origin._ref === destination?._ref
        ? "Origin and destination must differ."
        : true
    }),
    preview: {
      select: {
        flightNumber: "flightNumber",
        origin: "origin.iataCode",
        destination: "destination.iataCode",
        departureAt: "departureAt",
        salesStatus: "salesStatus"
      },
      prepare({ flightNumber, origin, destination, departureAt, salesStatus }) {
        const date = departureAt
          ? new Date(departureAt).toLocaleString("en", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "UTC"
          })
          : "Time unset"
        return {
          title: `${flightNumber || "Flight"} · ${origin || "???"} → ${destination || "???"}`,
          subtitle: `${date} UTC · ${salesStatus} || "draft"`
        }
      }
    },
    orderings: [
      {
        title: "Departure time",
        name: "departureAscending",
        by: [{ field: "departureAt", direction: "asc" }]
      }
    ]
})