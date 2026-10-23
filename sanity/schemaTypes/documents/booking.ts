import { LockIcon } from "@sanity/icons/Lock"
import { defineField, defineType } from "sanity"
import { CABIN_CLASSES } from "@/sanity/schemaTypes/shared/options"

const locked = true

export const booking = defineType({
  name: "booking",
  title: "Booking",
  type: "document",
  icon: LockIcon,
  fields: [
    defineField({
      name: "bookingReference",
      title: "Booking reference",
      type: "string",
      readOnly: locked
    }),
    defineField({
      name: "ownerClerkUserId",
      title: "Owner Clerk user ID",
      type: "string",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'ownerKey',
      title: "Owner lookup key",
      type: "string",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "requestId",
      title: "Idempotency request ID",
      type: "string",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "status",
      title: "Booking status",
      type: "string",
      options: {
        list: [
          { title: "Held", value: "held" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Expired", value: "expired" },
          { title: "Payment declined", value: "payment-declined" }
        ]
      },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'tripType',
      title: 'Trip type',
      type: 'string',
      options: {
        list: [
          { title: "One way", value: 'one-way' },
          { title: "Round trip", value: "round-trip" }
        ]
      },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: 'cabinClass',
      title: "Cabin class",
      type: "string",
      options: { list: CABIN_CLASSES },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "outbound",
      title: "Outbound leg",
      type: "bookingLegSnapshot",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "inbound",
      title: "Inbound leg",
      type: "bookingLegSnapshot",
      readOnly: locked,
      hidden: ({ parent }) => parent?.tripType === "one-way",
      validation: rule => 
        rule.custom((value, context) => {
          const tripType = (context.parent as {tripType?: string} | undefined)?.tripType
          if (tripType === "round-trip" && !value) {
            return 'Round trips require an inbound leg.'
          }
          if (tripType === "one-way" && value) {
            return 'One-way bookings cannot contain an inbound leg.'
          } 
          return true
        })
    }),
    defineField({
      name: "quote",
      title: "Locked quote",
      type: "pricingQuote",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "farePolicyRevision",
      title: "fare-policy revision",
      type: "string",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "proAtQuote",
      title: "Pro entitlement applied at quote time",
      type: "boolean",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "holdExpiresAt",
      title: "Seat hold expires at",
      type: "datetime",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "passenger",
      title: "Passenger",
      type: "passenger",
      readOnly: locked
    }),
    defineField({
      name: "paymentState",
      title: "Dummy parent state",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Succeeded", value: "succeeded"},
          { title: "Declined", value: "declined" }
        ]
      },
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({
      name: "ticket",
      title: "Ticket",
      type: "reference",
      to: [{ type: "ticket" }],
      readOnly: locked
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      readOnly: locked,
      validation: rule => rule.required()
    }),
    defineField({ 
      name: "confirmedAt",
      title: "Confirmed at",
      type: "datetime",
      readOnly: locked
    })
  ],
  preview: {
    select: {
      reference: "bookingReference",
      status: "status",
      outbound: "outbound.flightNumber",
      inbound: "inbound.flightNumber",
      tripType: "tripType"
    },
    prepare({ reference, status, outbound, inbound, tripType }) {
      return {
        title: reference || "Held booking",
        subtitle: 
          tripType === "one-way"
            ? `${outbound || "Outbound"} · one way · ${status || "unknown"}`
            : `${outbound || "Outbound"} / ${inbound || 'Inbound'} · ${status || "unknown"}`
      }
    }
  }
})