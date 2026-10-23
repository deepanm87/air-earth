import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe"
import { defineField, defineType } from "sanity"

export const airport = defineType({
  name: 'airport',
  title: 'Airport',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'iataCode',
      title: 'IATA code',
      type: 'string',
      description: 'Three-letter uppercase airport code.',
      validation: rule => rule.required().regex(/^[A-Z]{3}$/)
    }),
    defineField({
      name: 'name',
      title: 'Airport name',
      type: 'string',
      validation: rule => rule.required().min(3)
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'timezone',
      title: 'IANA timezone',
      type: 'string',
      description: 'Used to interpret local search dates, including DST.',
      validation: rule => 
        rule.required().custom(value => {
          if (!value) {
            return true
          }
          try {
            new Intl.DateTimeFormat('en', {timeZone: value}).format()
            return true
          } catch {
            return 'Enter a valid IANA timezone, for example Europe/London'
          }
        })
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
    select: { title: 'iataCode', city: 'city', name: 'name', active: 'active' },
    prepare({ title, city, name, active }) {
      return {
        title: `${title || '???'} · ${city || 'Unknown city'}`,
        subtitle: `${name || 'Unnamed airport'}${active === false ? ' · Inactive' : ''}`
      }
    }
  },
  orderings: [
    { title: 'IATA code', name: 'iataAscending', by: [{ field: 'iataCode', direction: 'asc' }]}
  ]
})