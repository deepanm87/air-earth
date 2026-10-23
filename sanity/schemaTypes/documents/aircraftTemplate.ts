import { MasterDetailIcon } from "@sanity/icons/MasterDetail"
import { defineArrayMember, defineField, defineType } from "sanity"

type CabinSectionLike = {
  cabinClass?: string
  order?: number
  rowStart?: number
  rowEnd?: number
  expectedSeatCount?: number
  seats?: unknown[]
}

const REQUIRED_LAYOUT = [
  { cabinClass: "first", order: 1, rowStart: 1, rowEnd: 2, count: 8 },
  { cabinClass: "business", order: 2, rowStart: 3, rowEnd: 7, count: 20 },
  { cabinClass: "economy", order: 3, rowStart: 8, rowEnd: 25, count: 108 }
]

export const aircraftTemplate = defineType({
  name: "aircraftTemplate",
  title: "Aircraft template",
  type: "document",
  icon: MasterDetailIcon,
  fields: [
    defineField({
      name: "name",
      title: "Template name",
      type: "string",
      validation: rule => rule.required()
    }),
    defineField({
      name: 'code',
      title: "Template code",
      type: "string",
      validation: rule => rule.required()
    }),
    defineField({
      name: "layoutVersion",
      title: "Layout version",
      type: "string",
      validation: rule => rule.required()
    }),
    defineField({
      name: "layoutStatus",
      title: "Layout Status",
      type: "string",
      description: "Locked layouts are versioned. Create a new template version instead of moving seats.",
      readOnly: ({document}) => document?.layoutStatus === "locked",
      options: {
        list: [
          { title: "Draft", value: 'draft' },
          { title: "Locked", value: 'locked' }
        ],
        layout: 'radio'
      },
      initialValue: 'draft',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'active',
      title: "Available for new flights",
      type: "boolean",
      initialValue: true,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'cabinSections',
      title: "Cabin sections (front to back)",
      description: "The nose is above row 1. Required order: First, Business, Economy.",
      type: 'array',
      readOnly: ({document}) => document?.layoutStatus === "locked",
      of: [defineArrayMember({ type: "aircraftCabinSection"})],
      validation: rule => rule.required()
    }),
    defineField({
      name: 'cabinSections',
      title: 'Cabin sections (front to back)',
      description: 'The nose is above row 1. Required order: First, Business, Economy.',
      type: 'array',
      readOnly: ({document}) => document?.layoutStatus === "locked",
      of: [defineArrayMember({ type: 'aircraftCabinSection'})],
      validation: rule => 
        rule
          .required()
          .length(3)
          .custom(value => {
            const sections = (value ?? []) as CabinSectionLike[]
            for (const required of REQUIRED_LAYOUT) {
              const section = sections.find(item => item.cabinClass === required.cabinClass)
              if (!section) {
                return `Missing ${required.cabinClass} cabin section.`
              }
              if (
                section.order !== required.order ||
                section.rowStart !== required.rowStart ||
                section.rowEnd !== required.rowEnd ||
                section.expectedSeatCount !== required.count ||
                section.seats?.length !== required.count
              ) {
                return `${required.cabinClass} must be order ${required.order},  rows ${required.rowStart}-${required.rowEnd}, with ${required.count} seats.`
              }
            }
            return true
          })
    })
  ],
  preview: {
    select: {
      name: 'name',
      model: 'aircraftModel',
      version: 'layoutVersion',
      status: 'layoutStatus'
    },
    prepare({ name, model, version, status}) {
      return {
        title: name || "Unnamed aircraft",
        subtitle: `${model || "Model unset"} · ${version || "No version"} · ${status || 'draft'}`
      }
    }
  }
})
