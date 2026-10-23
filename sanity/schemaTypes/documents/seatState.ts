import { LockIcon } from "@sanity/icons/Lock"
import { defineField, defineType } from "sanity"
import { CABIN_CLASSES, SEAT_POSITIONS, SEAT_PRODUCTS } from "@/sanity/schemaTypes/shared/options"

const locked = true

export const seatState = defineType({
  name: "seatState",
  title: "Sparse seat claim",
  type: "document",
  description: "Operational claim created only for a real hold or confirmed booking. If no deterministic document exists for a flight-seat pair, that seat is available.",
  icon: LockIcon,
  fields: [
    defineField({
      name: "flight",
      title: "Flight",
      type: "reference",
      to: [{ type: "flight" }],
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "flightId",
      title: "Flight document ID",
      type: "string",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "seatCode",
      title: "Seat code",
      type: "string",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "cabinClass",
      title: "Cabin class",
      type: "string",
      options: { list: CABIN_CLASSES },
      readOnly: locked,
      validation: rule => rule.required().integer()
    }),
    defineField({
      name: "row",
      title: "Row",
      type: "number",
      readOnly: locked,
      validation: rule => rule.required().integer()
    }),
    defineField({
      name: "column",
      title: "Column",
      type: "string",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "position",
      title: "Position",
      type: "string",
      options: { list: SEAT_POSITIONS },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "product",
      title: "Product",
      type: "string",
      options: { list: SEAT_PRODUCTS },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "accessible",
      title: "Accessible seat",
      type: "boolean",
      readOnly: locked,
    }),
    defineField({
      name: "blocked",
      title: "Layout-blocked seat",
      type: "boolean",
      readOnly: locked,
    }),
    defineField({
      name: "seatFeeMinor",
      title: "Seat fee (minor units)",
      type: "number",
      readOnly: locked,
      validation: rule => rule.required().integer().min(0)
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Held claims with an expired holdExpiresAt are treated as available until reused or cleaned up.",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Held", value: "held" },
          { title: "Booked", value: "booked" },
          { title: "Blocked", value: "blocked" }
        ]
      },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'holdExpiresAt',
      title: "Hold expires at",
      type: "datetime",
      readOnly: locked
    }),
    defineField({
      name: "heldByBookingId",
      title: "Held by booking ID",
      type: "string",
      readOnly: locked
    }),
    defineField({
      name: "holdOwnerKey",
      title: "Hold owner lookup key",
      description: "One-way owner lookup key. Never stores a raw Clerk user ID.",
      type: "string",
      readOnly: locked
    }),
    defineField({
      name: "bookingId",
      title: "Confirmed booking ID",
      type: "string",
      readOnly: locked
    }),
    defineField({
      name: "inventoryRevision",
      title: "Inventory revision",
      type: "string",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "updatedAt",
      title: "Last inventory update",
      type: "datetime",
      readOnly: locked,
      validation: rule => rule.required()
    })
  ],
  preview: {
    select: {
      seatCode: "seatCode",
      flightNumber: "flight.flightNumber",
      cabinClass: "cabinClass",
      status: "status"
    },
    prepare({ seatCode, flightNumber, cabinClass, status }) {
      return {
        title: `${flightNumber || 'Flight'} · ${seatCode || 'Seat'}`,
        subtitle: `${cabinClass || 'cabin'} · ${status || 'unknown'}`
      }
    }
  }
})