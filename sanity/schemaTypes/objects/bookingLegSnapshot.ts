import { CalendarIcon } from "@sanity/icons/Calendar"
import { defineField, defineType } from "sanity"
import { CABIN_CLASSES, SEAT_POSITIONS, SEAT_PRODUCTS } from "@/sanity/schemaTypes/shared/options"

export const bookingLegSnapshot = defineType({
  name: 'bookingLegSnapshot',
  title: 'Booking leg snapshot',
  type: 'object',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'direction',
      title: 'Direction',
      type: 'string',
      options: {
        list: [
          { title: 'Outbound', value: 'outbound' },
          { title: 'Inbound', value: 'inbound' }
        ]
      },
      validation: rule => rule.required()
    }),
    defineField({ 
      name: 'flight',
      title: 'Flight',
      type: 'reference',
      to: [{ type: 'flight' }]
    }),
    defineField({
      name: 'flightId',
      title: 'Flight document ID',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'flightId',
      title: 'Flight document ID',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'FlightNumber',
      title: 'Flight number',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'originIata',
      title: 'Origin IATA',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'destinationIata',
      title: 'Destination IATA',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'departureAt',
      title: 'Departure (UTC)',
      type: 'datetime',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'arrivalAt',
      title: 'Arrival(UTC)',
      type: 'datetime',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'departureLocalDate',
      title: 'Departure local date',
      type: 'date',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'arrivalLocalDate',
      title: 'Arrival local time',
      type: 'date',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'departureLocalTime',
      title: 'Departure local time',
      type: 'string',
      validation: rule => rule.regex(/(^[01]\d|2[0-3]):[0-5]\d$/),
    }),
    defineField({
      name: 'arrivalLocalTime',
      title: 'Arrival local time',
      type: 'string',
      validation: rule => rule.regex(/(^[01]\d|2[0-3]):[0-5]\d$/)
    }),
    defineField({
      name: 'cabinClass',
      title: 'Cabin class',
      type: 'string',
      options: { list: CABIN_CLASSES },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'seatCode',
      title: 'Seat code',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'seatStateId',
      title: 'Seat-state document ID',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'seatPosition',
      title: 'Seat position',
      type: 'string',
      options: { list: SEAT_POSITIONS },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'seatProduct',
      title: 'Seat product',
      type: 'string',
      options: { list: SEAT_PRODUCTS },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'baseFareMinor',
      title: 'Base fare (minor units)',
      type: 'number',
      validation: rule => rule.required().integer().min(0)
    }),
    defineField({
      name: 'seatFeeMinor',
      title: 'Seat fee (minor units)',
      type: 'number',
      validation: rule => rule.required().integer().min(0)
    })
  ],
  preview: {
    select: {
      direction: 'direction',
      flightNumber: 'flightNumber',
      originIata: 'originIata',
      destinationIata: 'destinationIata',
      seatCode: 'seatCode'
    },
    prepare({ direction, flightNumber, originIata, destinationIata, seatCode }) {
      return {
        title: `${direction === 'inbound' ? 'Inbound' : 'Outbound'} · ${flightNumber || 'Flight'}`,
        subtitle: `${originIata || '???'} → ${destinationIata || '???'} · Seat ${seatCode || 'unassigned'}`
      }
    }
  }
})