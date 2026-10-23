import { HelpCircleIcon } from "@sanity/icons/HelpCircle"
import { defineArrayMember, defineField, defineType } from "sanity"

export const policyFaq = defineType({
  name: 'policyFaq',
  title: 'Common customer question',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'questionKey',
      title: 'Question key',
      type: 'string',
      description: 'Stable identifier used by the concierge and seed data.',
      validation: rule => rule.required().max(80).regex(/^[a-z0-9-]+$/)
    }),
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: rule => rule.required().max(180)
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 4,
      validation: rule => rule.required().max(1_000)
    }),
    defineField({
      name: 'searchTerms',
      title: 'Alternative wording',
      type: 'array',
      description: 'Short phrases travelers may use for the same question.',
      of: [defineArrayMember({ type: 'string' })],
      validation: rule => rule.max(8).unique()
    })
  ],
  preview: {
    select: {
      question: 'question',
      answer: 'answer'
    },
    prepare({ question, answer }) {
      return {
        title: question || 'Untitled question',
        subtitle: answer || 'No answer supplied'
      }
    }
  }
})