import { MasterDetailIcon } from "@sanity/icons/MasterDetail"
import { defineField, defineType } from "sanity"
import { CABIN_CLASSES, SEAT_POSITIONS, SEAT_PRODUCTS, cabinTitle } from "@/sanity/schemaTypes/shared/options"

export const aircraftSeat = defineType({
  name: 'aircraftSeat',
  title: 'Aircraft seat',
  type: 'object',
  icon: MasterDetailIcon,
  fields: [
    defineField({
      name: 'seatCode',
      title: 'Seat code',
      type: 'string',
      description: 'Row and column label shown to travelers. for example 12A.',
      validation: rule => 
        rule.required().regex(/^([1-9]1\d|2[0-5]))[A-GK]$/, {
          name: 'seat code',
          invert: false
        })
    }),
    defineField({
      name: 'cabinClass',
      title: 'Cabin class',
      type: 'string',
      options: { list: CABIN_CLASSES, layout: 'radio' },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'row',
      title: 'Row',
      type: 'number',
      validation: rule => rule.required().integer().min(1).max(25)
    }),
    defineField({
      name: 'column',
      title: 'Column',
      type: 'string',
      options: { list: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'K'], layout: 'dropdown' },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'position',
      title: 'Seat position',
      type: 'string',
      options: { list: SEAT_POSITIONS, layout: 'radio' },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'product',
      title: 'Seat product',
      type: 'string',
      options: { list: SEAT_PRODUCTS, layout: 'radio' },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'accessible',
      title: 'Accessible seat',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'blocked',
      title: 'Permanently blocked',
      description: 'Use for a seat that must never be offered for booking.',
      type: 'boolean',
      initialValue: false
    })
  ],
  preview: {
    select: { seatCode: 'seatCode', cabinClass: 'cabinClass', product: 'product' },
    prepare({ seatCode, cabinClass, product }) {
      return {
        title: seatCode || 'Unnamed seat',
        subtitle: `${cabinTitle(cabinClass)} · ${product || 'Seat product not set'}`
      }
    }
  }
})