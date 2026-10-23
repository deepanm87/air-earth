import { LockIcon } from "@sanity/icons/Lock"
import { defineArrayMember, defineField, defineType } from "sanity"
import { CABIN_CLASSES, cabinTitle } from "@/sanity/schemaTypes/shared/options"

export const flightCabinSnapshot = defineType({
  name: 'flightCabinSnapshot',
  title: 'Flight cabin snapshot',
  type: 'object',
  icon: LockIcon,
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
      options: { list: CABIN_CLASSES },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'name',
      title: 'cabin name',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: rule => rule.unique()
    }),
    defineField({
      name: 'baggageCopy',
      title: 'Baggage allowance',
      type: 'string'
    }),
    defineField({
      name: 'rowStart',
      title: 'First row',
      type: 'number',
      validation: rule => rule.required().integer()
    }),
    defineField({
      name: 'rowEnd',
      title: 'Last row',
      type: 'number',
      validation: rule => rule.required().integer()
    }),
    defineField({
      name: 'configuration',
      title: 'Configuration',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'seats',
      title: 'Seats',
      type: 'array',
      of: [defineArrayMember({ type: 'aircraftSeat' })],
      validation: rule => rule.required().min(1)
    })
  ],
  preview: {
    select: {
      cabinClass: 'cabinClass',
      rowStart: 'rowStart',
      rowEnd: 'rowEnd',
      seats: 'seats'
    },
    prepare({ cabinClass, rowStart, rowEnd, seats }) {
      return {
        title: cabinTitle(cabinClass),
        subtitle: `Rows ${rowStart ?? '?'}-${rowEnd ?? '?'} · ${seats?.length ?? 0} seats`
      }
    }
  }
})