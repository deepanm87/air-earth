import { BillIcon } from "@sanity/icons/Bill"
import { defineArrayMember, defineField, defineType } from "sanity"
import { CURRENCY_OPTIONS } from "@/sanity/schemaTypes/shared/options"

type FeeRuleLike = {
  cabinClass?: string
  position?: string
  product?: string
}

export const farePolicy = defineType({
  name: 'farePolicy',
  title: 'Fare policy',
  type: 'document',
  icon: BillIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Policy name',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'revision',
      title: 'Revision',
      type: 'string',
      description: 'Copied into each quote for auditability.',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: { list: CURRENCY_OPTIONS },
      initialValue: 'USD',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'proSeatDiscountPercent',
      title: 'Pro seat-selection discount (%)',
      type: 'number',
      description: 'Applies only to paid seat-selection fees, never base cabin fares.',
      validation: rule => rule.required().min(0).max(100)
    }),
    defineField({
      name: 'seatFeeRules',
      title: 'Seat-selection fees',
      type: 'array',
      of: [defineArrayMember({ type: 'seatFeeRule' })],
      validation: rule => 
        rule
          .required()
          .min(1)
          .custom(value => {
            const keys = ((value ?? []) as FeeRuleLike[]).map(
              item => `${item.cabinClass}:${item.position}:${item.product}`
            )
            return (
              new Set(keys).size === keys.length ||
              'Each cabin, position, and product combination must be unique.'
            )
          })
    }),
    defineField({
      name: 'activeFrom',
      title: 'Active from',
      type: 'datetime',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      validation: rule => rule.required()
    })
  ],
  preview: {
    select: { 
      title: 'name',
      revision: 'revision',
      discount: 'proSeatDiscountPercent'
    },
    prepare({ title, revision, discount }) {
      return {
        title: title || "Unnamed fare policy",
        subtitle: `${revision || 'No revision'} · Pro saves ${discount ?? 0}% on seat fees`
      }
    }
  }
})