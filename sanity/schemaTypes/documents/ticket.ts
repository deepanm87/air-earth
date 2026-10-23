import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { CABIN_CLASSES } from '@/sanity/schemaTypes/shared/options'

const locked = true

export const ticket = defineType({
  name: 'ticket',
  title: 'Ticket',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'ticketNumber',
      title: 'TicketNumber',
      type: 'string',
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'booking',
      title: 'Booking',
      type: 'reference',
      to: [{ type: 'booking' }],
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'bookingId',
      title: 'booking document ID',
      type: 'string',
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'ownerClerkUIserId',
      title: 'Owner Clerk user ID',
      type: 'string',
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'passengerFullName',
      title: 'Passenger full legal name',
      type: 'string',
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'tripType',
      title: 'Trip type',
      type: 'string',
      options: {
        list: [
          { title: 'One way', value: 'one-way' },
          { title: 'Round trip', value: 'round-trip' }
        ]
      },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'cabinClass',
      title: 'Cabin class',
      type: 'string',
      options: { list: CABIN_CLASSES },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'segments',
      title: 'Immutable flight segments',
      type: 'array',
      readOnly: locked, 
      of: [defineArrayMember({ type: 'ticketSegmentSnapshot' })],
      validation: rule => 
        rule
          .required()
          .min(1)
          .max(2)
          .custom((value, context) => {
            const directions = ((value ?? []) as { direction?: string}[]).map(
              item => item.direction
            )
            const tripType = (context.parent as {tripType?: string} | undefined)?.tripType
            if (tripType === 'one-way') {
              return directions.length === 1 && directions[0] === 'outbound'
                ? true
                : 'One-way tickets require exactly one outbound segment.'
            }
            return directions.length === 2 &&
              directions[0] === 'outbound' &&
              directions[1] === 'inbound'
              ? true
              : 'Round-trip tickets require ordered outbound and inbound segments.'
          })
    }),
    defineField({
      name: 'quote',
      title: 'Final price snapshot',
      type: 'pricingQuote',
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'issuedAt',
      title: 'Issued at',
      type: 'datetime',
      readOnly: locked,
      validation: rule => rule.required()
    })
  ],
  preview: {
    select: {
      ticketNumber: 'ticketNumber',
      passenger: 'passengerFullName',
      cabinClass: 'cabinClass'
    },
    prepare({ ticketNumber, passenger, cabinClass }) {
      return {
        title: ticketNumber || 'Ticket',
        subtitle: `${passenger || 'Passenger'} · ${cabinClass || 'cabin'}`
      }
    }
  }
})