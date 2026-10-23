import { UserIcon } from "@sanity/icons/User"
import { defineField, defineType } from "sanity"

export const passenger = defineType({
  name: 'passenger',
  title: 'Passenger',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full legal name',
      type: 'string',
      description: 'The demo stores only a full legal name. Do not add passport, DOB, or payment card fields.',
      validation: rule => rule.required().min(2).max(120)
    })
  ]
})