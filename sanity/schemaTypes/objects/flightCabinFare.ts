import { BillIcon } from "@sanity/icons/Bill"
import { defineField, defineType } from "sanity"
import { CABIN_CLASSES, CURRENCY_OPTIONS, cabinTitle } from "@/sanity/schemaTypes/shared/options"

export const flightCabinFare = defineType({
  name: 'flightCabinFare',
  title: 'Flight cabin fare', 
  type: 'object',
  icon: BillIcon,
  fields: [
    defineField({
      name: 'cabinClass',
      title: 'Cabin class',
      type: 'string',
      options: { list: CABIN_CLASSES, layout: 'radio' },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'baseFareMinor',
      title: 'Base fare (minor units)',
      description: 'Whole US cents for one segment and one traveler.',
      type: 'number',
      validation: rule => rule.required().integer().min(0)
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'USD',
      options: { list: CURRENCY_OPTIONS},
      validation: rule => rule.required()
    }),
    defineField({
      name: 'capacity',
      title: 'Cabin capacity',
      type: 'number',
      description: 'Fixed capacity ceiling copied from the flight seat-layout snapshot.',
      validation: rule => rule.required().integer().min(0)
    }),
    defineField({
      name: 'remainingSeats',
      title: 'Remaining seats',
      type: 'number',
      description: 'Search-display baseline from the unblocked layout. Runtime reads overlay sparse held/booked seat claims before presenting live availability.',
      validation: rule => rule.required().integer().min(0)
    }),
    defineField({
      name: 'farePolicyRevision',
      title: 'Fare policy revision',
      type: 'string',
      readOnly: true,
      validation: rule => rule.required()
    })
  ],
  preview: {
    select: {
      cabinClass: 'cabinClass',
      baseFareMinor: 'baseFareMinor',
      remainingSeats: 'remainingSeats'
    },
    prepare({ cabinClass, baseFareMinor, remainingSeats }) {
      const fare = 
        typeof baseFareMinor === 'number' ? `$${(baseFareMinor / 100).toFixed(0)}` : 'Fare unset'
      return { title: cabinTitle(cabinClass), subtitle: `${fare} · ${remainingSeats ?? 0} remaining`}
    }
  }
})