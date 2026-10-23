import { TagIcon } from "@sanity/icons/Tag"
import { defineArrayMember, defineField, defineType } from "sanity"

export const membershipBenefit = defineType({
  name: "membershipBenefit",
  title: "Membership benefit",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      title: "Benefit name",
      type: "string",
      validation: rule => rule.required()
    }),
    defineField({
      name: "featureKey",
      title: "Clerk feature key",
      type: "string",
      description: "Documentation only. Clerk remains the entitlement source of truth.",
      validation: rule => rule.required().regex(/^[a-z0-9_]+$/)
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: rule => rule.required()
    }),
    defineField({
      name: "terms",
      title: "Terms",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: rule => rule.required().min(1)
    }),
    defineField({
      name: "commonQuestions",
      title: "Common customer questions",
      type: "array",
      description: "Customer-facing answers about this benefit. Do not include private account data.",
      of: [defineArrayMember({ type: "policyFaq" })],
      validation: rule => rule.required().min(1).max(8)
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
      validation: rule => rule.required()
    })
  ]
})