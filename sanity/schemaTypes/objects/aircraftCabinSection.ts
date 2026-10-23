import { StackCompactIcon } from "@sanity/icons/StackCompact"
import { defineArrayMember, defineField, defineType } from "sanity"
import { CABIN_CLASSES, cabinTitle } from "@/sanity/schemaTypes/shared/options"

type SeatLike = { 
  seatCode?: string
  cabinClass?: string
  row?: number
}

export const aircraftCabinSection = defineType({
  name: 'aircraftCabinSection',
  title: 'Aircraft cabin section',
  type: 'object',
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: 'order',
      title: 'Front-to-back order',
      type: 'number',
      validation: rule => rule.required().integer().min(1).max(3)
    }),
    defineField({
      name: 'cabinClass',
      title: 'Cabin class',
      type: 'string',
      options: { list: CABIN_CLASSES, layout: 'radio' },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'cabinProduct',
      title: 'Cabin product',
      type: 'reference',
      to: [{ type: 'cabinProduct' }],
      validation: rule => rule.required()
    }),
    defineField({
      name: 'rowStart',
      title: 'First row',
      type: 'number',
      validation: rule => rule.required().integer().min(1).max(25)
    }),
    defineField({
      name: 'rowEnd',
      title: 'Last row',
      type: 'number',
      validation: rule =>
        rule
          .required()
          .integer()
          .min(1)
          .max(25)
          .custom((value, context) => {
            const start = (context.parent as { rowStart?: number})?.rowStart
            return start && value && value < start ? 'Last row must not precede first row.' : true
          })
    }),
    defineField({
      name: 'configuration',
      title: 'Seat configuration',
      type: 'string',
      description: 'Seat groups separated by aisles, for example 1-2-1.',
      validation: rule => rule.required().regex(/^\d(-\d)+$/)
    }),
    defineField({
      name: 'expectedSeatCount',
      title: 'Expected seat count',
      type: 'number',
      readOnly: true,
      validation: rule => rule.required().integer().min(1)
    }),
    defineField({
      name: 'seats',
      title: 'Seats',
      type: 'array',
      of: [defineArrayMember({ type: 'aircraftSeat' })],
      validation: rule =>
        rule
          .required()
          .min(1)
          .custom((value, context) => {
            const seats = (value ?? []) as SeatLike[]
            const section = context.parent as {
              cabinClass?: string
              rowStart?: number
              rowEnd?: number
              expectedSeatCount?: number
            }
            const codes = seats.map(seat => seat.seatCode).filter(Boolean)
            if (new Set(codes).size !== codes.length) {
              return 'Seat codes must be unique in a cabin.'
            }
            if (section.expectedSeatCount !== undefined && seats.length !== section.expectedSeatCount) {
              return `Expected ${section.expectedSeatCount} seats, found ${seats.length}`
            }
            if (seats.some(seat => seat.cabinClass !== section.cabinClass)) {
              return `Every seat must belong to ${cabinTitle(section.cabinClass)}.`
            }
            if (
              seats.some(
                seat => 
                  seat.row === undefined ||
                (section.rowStart !== undefined && seat.row < section.rowStart) ||
                (section.rowEnd !== undefined && seat.row > section.rowEnd)
              )
            ) {
              return 'Every seat row must fall inside this cabin section.'
            }
            return true
          })
    })
  ],
  preview: {
    select: { cabinClass: 'cabinClass', configuration: 'configuration', seats: 'seats' },
    prepare({ cabinClass, configuration, seats }) {
      return {
        title: cabinTitle(cabinClass),
        subtitle: `${configuration || 'Layout unset'} · ${seats?.length ?? 0} seats`
      }
    }
  }
})