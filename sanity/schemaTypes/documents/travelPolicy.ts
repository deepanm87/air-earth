import { DocumentTextIcon } from "@sanity/icons/DocumentText"
import { defineArrayMember, defineField, defineType } from "sanity"

export const travelPolicy = defineField({
  name: 'travelPolicy',
  title: 'Travel policy',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'policyKey',
      title: 'Policy key',
      type: 'string',
      description: 'Stable lookup key for agents and channels.',
      validation: rule => rule.required().regex(/^[a-z0-9-]+$/)
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: rule => rule.required().max(500)
    }),
    defineField({
      name: 'details',
      title: 'Policy details',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: rule => rule.required()
    }),
    defineField({
      name: 'commonQuestions',
      title: 'Common customer questions',
      type: 'array',
      description: 'Concise, customer-facing answers the concierge can retrieve without inventing policy.',
      of: [defineArrayMember({ type: "policyFaq" })],
      validation: rule => rule.required()
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      validation: rule => rule.required()
    })
  ]
})