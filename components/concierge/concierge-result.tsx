import type { UIMessage } from "ai"
import { useId } from "react"
import ReactMarkdown from "react-markdown"

import { ArrowIcon, CheckIcon, SparkIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

type ApprovalHandler = (id: string, approved: boolean) => void
type QuickReplyHandler = (message: string) => void
type ConciergePart = UIMessage["parts"][number]

type QuickReplyOption = {
  label: string
  value: string
}

type QuickReplySet = {
  question?: string
  options: QuickReplyOption[]
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null
}

function toolName(value: Record<string, unknown>): string {
  const type = typeof value.type === "string" ? value.type : ""
  return type === "dynamic-tool" && typeof value.toolName === "string"
    ? value.toolName
    : type.replace("tool-", "")
}

function normalizedReplyText(value: string): string {
  return value
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, "")
    .trim()
}

function liveSeatPartSignature(part: ConciergePart): string | null {
  const value = asRecord(part)
  if (!value) {
    return null
  }
  const type = typeof value.type === "string" ? value.type : ""
  const name = 
    type === "dynamic-tool" && typeof value.toolName === "string"
      ? value.toolName
      : type.replace("tool-", "")
  if (name !== "get_live_seat_options") {
    return null
  }

  const input = asRecord(value.input)
  const output = asRecord(value.output)
  const flightId = input?.flightId ?? output?.flightId
  if (typeof flightId !== "string") {
    return null
  }

  return [
    flightId,
    input?.cabinClass ?? output?.cabinClass ?? "any",
    input?.preference ?? output?.preference ?? "any",
    input?.maximumSeatFeeMinor ?? "any"
  ].join(":")
}

function isQuickReplyPart(part: ConciergePart): boolean {
  const value = asRecord(part)
  return Boolean(value && toolName(value) === "present_quick_replies")
}

function quickReplyPartSignature(part: ConciergePart): string | null {
  const value = asRecord(part)
  if (!value || toolName(value) !== "present_quick_replies") {
    return null
  }
  const content = asRecord(value.output) ?? asRecord(value.input)
  const question = 
    typeof content?.question === "string" ? content.question : ""
  const options = Array.isArray(content?.options) ? content.options : []
  const optionSignature = options
    .map(option => {
      const item = asRecord(option)
      return [item?.label, item?.value ?? item?.message].map(String).join(":")
    })
    .join("|")
  return (
    normalizedReplyText(`${question}|${optionSignature}`) ||
    "present-quick-replies"
  )
}

function parseQuickReplySet(
  output: Record<string, unknown>
): QuickReplySet | null {
  const rawOptions = Array.isArray(output.options) ? output.options : []
  const seenLabels = new Set<string>()
  const seenValues = new Set<string>()
  const options: QuickReplyOption[] =[]

  for (const option of rawOptions) {
    const item = asRecord(option)
    const label = typeof item?.label === "string" ? item.label.trim() : ""
    const rawValue = typeof item?.value === "string" ? item.value : item?.message
    const value = typeof rawValue === "string" ? rawValue.trim() : ""
    const labelKey = normalizedReplyText(label)
    const valueKey = normalizedReplyText(value)
    if (
      !label ||
      !value ||
      seenLabels.has(labelKey) ||
      seenValues.has(valueKey)
    )
    continue
    seenLabels.add(labelKey)
    seenValues.add(valueKey)
    options.push({ label, value })
    if (options.length === 3) {
      break
    }
  }

  if (options.length < 2) {
    return null
  }
  const question = typeof output.question === "string" ? output.question.trim() : ""
  return { 
    question: question || undefined,
    options 
  }
}

function hasAvailableQuickReplies(part: ConciergePath): boolean {
  if(!isQuickReplyPart(part)) {
    return false
  }
  const value = asRecord(part)
  const output = asRecord(value?.output)
  return (
    value?.state === "output-available" &&
    Boolean(output && parseQuickReplySet(output))
  )
}

function fallbackQuickReplySet(text: string): QuickReplySet | null {
  const normalized = normalizedReplyText(text)
  if (
    (normalized.includes("one way") && normalized.includes("return date")) ||
    (normalized.includes("one way") && normalized.includes("round trip"))
  ) {
    return {
      options: [
        { label: "Book one way", value: "Book this as a one-way trip." },
        { label: "Add a return", value: "Add a return flight." }
      ]
    }
  }
  return null
}

function visibleConciergeParts(message: UIMessage): ConciergePart[] {
  const latestSeatPart = new Map<string, number>()
  const latestQuickReplyPart = new Map<string, number>()
  message.parts.forEach((part, index) => {
    const seatSignature = liveSeatPartSignature(part)
    const replySignature = hasAvailableQuickReplies(part)
      ? quickReplyPartSignature(part)
      : null
    if (seatSignature) {
      latestSeatPart.set(seatSignature, index)
    }
    if (replySignature) {
      latestQuickReplyPart.set(replySignature, index)
    }
  })

  return message.parts.filter((part, index) => {
    if (part.type === "text") {
      return part.text.trim().length > 0
    }
    if (part.type !== "dynamic-tool" && !part.type.startsWith("tool-")) {
      return false
    }
    if (isQuickReplyPart(part) && !hasAvailableQuickReplies(part)) {
      return false
    }
    const seatSignature = liveSeatPartSignature(part)
    const replySignature = quickReplyPartSignature(part)
    if (seatSignature && latestSeatPart.get(seatSignature) !== index) {
      return false
    }
    if (replySignature && latestQuickReplyPart.get(replySignature) !== index) {
      return false
    }
    return true
  })
}

export function hasVisibleConciergeContent(message: UIMessage): boolean {
  return visibleConciergeParts(message).length > 0
}

const toolLabels: Record<string, { 
  pending: string
  complete: string
}> = {
  search_context_flights: {
    pending: "Searching flights...",
    complete: "Matched with Sanity Context"
  },
  render_flight_options: {
    pending: "Loading flights...",
    complete: "Flights ready"
  },
  groq_query: {
    pending: "Checking schedules...",
    complete: "Schedule checked"
  },
  context_catalog_query: {
    pending: "Checking published information...",
    complete: "Published information checked"
  },
  schema_explorer: {
    pending: "Checking flight details...",
    complete: "Flight details checked"
  },
  render_round_trip_options: {
    pending: "Loading flights...",
    complete: "Flights ready"
  },
  compare_cabin_fares: {
    pending: "Comparing cabins...",
    complete: "Cabins compared"
  },
  get_live_seat_options: {
    pending: "Checking seats...",
    complete: "Seats checked"
  },
  quote_round_trip: {
    pending: "Updating the total...",
    complete: "Price confirmed"
  },
  quote_itinerary: {
    pending: "Updating the total...",
    complete: "Price confirmed"
  },
  hold_round_trip: {
    pending: "Reserving your flights...",
    complete: "Ready for checkout"
  },
  hold_itinerary: {
    pending: "Reserving your selection...",
    complete: "Ready for checkout"
  },
  prepare_checkout: {
    pending: "Preparing checkout...",
    complete: "Checkout ready"
  },
  present_quick_replies: {
    pending: "Preparing options...",
    complete: "Options ready"
  }
}

function titleCase(value: unknown): string {
  return String(value ?? "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, character => character.toUpperCase())
}

function formatMoney(value: unknown, currency: unknown = "USD"): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Fare unavailable"
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: typeof currency === "string" ? currency : "USD",
    maximumFractionDigits: value % 100 === 0 ? 0 : 2
  }).format(value / 100)
}

function formatDuration(
  value: unknown,
  departureAt?: unknown,
  arrivalAt?: unknown
): string {
  let minutes = 
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : null
  if (
    minutes === null &&
    typeof departureAt === "string" &&
    typeof arrivalAt === "string"
  ) {
    const difference = 
      new Date(arrivalAt).getTime() - new Date(departureAt).getTime()
    if (Number.isFinite(difference) && difference > 0) {
      minutes = Math.round(difference / 60_000)
    }
  }
  if (minutes === null || minutes <= 0) {
    return "Duration pending"
  }
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (hours === 0) {
    return `${remainder}m`
  }
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`
}

function formatLocalTime(value: unknown, timezone: unknown): string {
  if (typeof value !== "string") {
    return "Time to be confirmred"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Time to be confirmed"
  }
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: typeof timezone === "string" ? timezone : "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date)
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date)
  }
}

function formatLocalDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) {
    return "requested date"
  }
  const date = new Date(`${value}T12:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  }).format(date)
}

function ToolStatus({
  name,
  complete = false
}: {
  name: string
  complete?: boolean
}) {
  const label = 
    toolLabels[name]?.[complete ? "complete" : "pending"] ??
    `${titleCase(name)}${complete ? "complete" : "..."}`
  return (
    <div
      className={`agent-status-row ${complete ? "agent-status-row-complete" : "agent-status-row-pending"}`}
      role="status"
    >
      {complete ? <CheckIcon /> : <span className="trace-dot" />}
      <span className="agent-status-copy">{label}</span>
    </div>
  )
}

function FlightCard({ flight }: { flight: unknown }) {
  const item = asRecord(flight)
  const origin = asRecord(item?.origin)
  const destination = asRecord(item?.destination)
  const routeParts = 
    typeof item?.route === "string" ? item.route.split("→") : []
  const originIata = String(
    origin?.iata ?? origin?.iataCode ?? routeParts[0]?.trim() ?? "-"
  )
  const destinationIata = String(
    destination?.iata ?? destination?.iataCode ?? routeParts[1]?.trim() ?? "-"
  )
  const flightNumber = String(item?.flightNumber ?? "Flight")
  const departure = 
    typeof item?.departureLocalTime === "string"
      ? item.departureLocalTime
      : formatLocalTime(item?.departureAt, origin?.timezone)
  const arrival = 
    typeof item?.arrivalLocalTime === "string"
    ? item.arrivalLocalTime === "string"
    : formatLocalTime(item?.arrivalAt, destination?.timezone)
  const departureDate = formatLocalDate(item?.departureLocalDate)
  const duration = formatDuration(
    item?.durationMinutes,
    item?.departureAt,
    item?.arrivalAt
  )
  const cabin = titleCase(item?.cabinClass ?? "selected cabin")
  const remainingSeats = 
    typeof item?.remainingSeats === "number"
      ? `${item.remainingSeats} ${item.remainingSeats === 1 ? "seat" : "seats"} available`
      : "Availability confirmed at booking"
  return (
    <article
      className="agent-flight-card agent-flight-card-compact"
      aria-label={`${flightNumber}, ${originIata} to ${destinationIata}, ${departure} to ${arrival}, ${duration}, ${cabin}, ${formatMoney(item?.baseFareMinor, item?.currency)}`}
    >
      <div className="agent-flight-main">
        <div className="agent-flight-route">
          <strong>
            {originIata} → {destinationIata}
          </strong>
          <span>{flightNumber}</span>
        </div>
        <div className="agent-flight-time">
          <strong>{departure}</strong>
          <i aria-hidden="true">→</i>
          <strong>{arrival}</strong>
        </div>
        <small className="agent-flight-meta">
          {departureDate} · {duration} · direct 
        </small>
      </div>
      <div className="agent-flight-fare">
        <strong>{formatMoney(item?.baseFareMinor, item?.currency)}</strong>
        <span>{cabin}</span>
        <small>{remainingSeats}</small>
      </div>
    </article>
  )
}

function FlightOptions({ output }: { output: Record<string, unknown> }) {
  const outbound = Array.isArray(output.outbound) ? output.outbound : []
  const inbound = Array.isArray(output.inbound) ? output.inbound : []
  const cabin = titleCase(output.cabinClass ?? "selected cabin")
  const renderLeg = (label: string, flights: unknown[]) => (
    <div>
      <small>{label}</small>
      {flights.length === 0 ? (
        <div className="agent-empty-result">
          No flight is available for this leg.
        </div>
      ) : (
        flights
          .slice(0, 3)
          .map((flight, index) => (
            <FlightCard 
              flight={flight}
              key={String(asRecord(flight)?.id ?? index)}
            />
          ))
      )}
    </div>
  )

  return (
    <div
      className="agent-itinerary-options"
      aria-label={`${cabin} round-trip options`}
    >
      {renderLeg("Outbound", outbound)}
      {renderLeg("Return", inbound)}
    </div>
  )
}

function SingleLegFlightOptions({
  output
}: {
  output: Record<string, unknown>
}) {
  const flights = Array.isArray(output.flights) ? output.flights : []
  const cabin = titleCase(output.cabinClass ?? "selected cabin")
  return (
    <div
      className="agent-itinerary-options"
      role="group"
      aria-label={`${cabin} single-leg flight options`}
    >
      <div>
        <small>Departure</small>
        {flights.length === 0 ? (
          <div className="agent-empty-result">
            No flight is currently available.
          </div>
        ) : (
          <>
            {flights.slice(0, 3).map((flight, index) => (
              <FlightCard 
                flight={flight}
                key={String(asRecord(flight)?.id ?? index)}
              />
            ))}
            {flights.length > 3 && (
              <div className="agent-result-count">
                + {flights.length - 3} more flights
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function resolvedAirports(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) {
    return "No airport resolved"
  }
  return value
    .slice(0, 4)
    .map(airport => {
      const item = asRecord(airport)
      const city = String(item?.city ?? item?.name ?? "Airport")
      const iata = String(item?.iataCode ?? item?.iata ?? "-")
      return `${city} ${iata}`
    })
    .join(", ")
}

function ContextFlightSearchResult({
  output
}: {
  output: Record<string, unknown>
}) {
  const status = asRecord(output.status)
  const resolution = asRecord(output.resolution)
  const filters = asRecord(output.filters)
  const flights = Array.isArray(output.flights) ? output.flights : []
  const route = 
    typeof status?.airportResolution === "string"
      ? status.airportResolution === "string"
      : `${resolvedAirports(resolution?.origin)} → ${resolvedAirports(resolution?.destination)}`
  const cabin = 
    filters?.cabinClass === "cheapest-available"
      ? "cheapest available cabin"
      : titleCase(filters?.cabinClass ?? "all selling cabins")
  const budget = 
    typeof filters?.maximumBaseFareMinor === "number"
      ? ` . up to ${formatMoney(filters.maximumBaseFareMinor)}`
      : ""
  const seatPreference = 
    typeof filters?.seatPreference  === "string"
    ? titleCase(filters.seatPreference)
    : "Any position"
  const matchCount = 
    typeof status?.matchCount === "number" ? status.matchCount : flights.length
  const hardFilters = 
    typeof status?.hardFilters === "string"
      ? status.hardFilters
      : `${formatLocalDate(filters?.departureLocalDate)} · around ${string(filters?.targetDepartureLocalTime ?? "requested time")} · ${cabin}${budget}`
  
  return (
    <div
      className="agent-context-result"
      role="group"
      aria-label="Sanity Context flight discovery status"
    >
      <ToolStatus name="search_context_flights" complete />
      <details className="agent-context-details">
        <summary>Why these flights</summary>
        <dl>
          <div>
            <dt>Route</dt>
            <dd>{route}</dd>
          </div>
          <div>
            <dt>Filters</dt>
            <dd>{hardFilters}</dd>
          </div>
          <div>
            <dt>Seat</dt>
            <dd>{seatPreference}</dd>
          </div>
          <div>
            <dt>Results</dt>
            <dd>{matchCount} found</dd>
          </div>
        </dl>
      </details>
    </div>
  )
}

function CabinComparison({ output }: { output: Record<string, unknown> }) {
  const cabins = Array.isArray(output.cabins) ? output.cabins : []
  return (
    <div
      className="agent-cabin-compare"
      aria-label="Round-trip cabin fare comparison"
    >
      {cabins.map((cabin, index) => {
        const item = asRecord(cabin)
        const available = 
          item?.available !== false &&
          typeof item?.totalBaseFareMinor === "number"
        return (
          <div key={String(item?.cabinClass ?? index)}>
            <span>{titleCase(item?.cabinClass ?? "cabin")}</span>
            <strong>
              {available 
                ? formatMoney(item?.totalBaseFareMinor, output.currency)
                : "Unavailable"
              }
            </strong>
          </div>
        )
      })}
    </div>
  ) 
}

function SeatOptions({
  output,
  onSelect,
  disabled = false
}: {
  output: Record<string, unknown>
  onSelect?: QuickReplyHandler
  disabled?: boolean
}) {
  const options = Array.isArray(output.recommendations)
    ? output.recommendations
    : Array.isArray(output.options)
      ? output.options
      : []

  const recommendations = options.slice(0, 3)
  const matchingAvailable = 
    typeof output.matchingAvailable === "number"
      ? output.matchingAvailable
      : options.length
  const totalAvailable = 
    typeof output.totalAvailable === "number"
      ? output.totalAvailable
      : matchingAvailable
  const moreAvailable = 
    typeof output.moreAvailable === "number"
      ? Math.max(0, output.moreAvailable)
      : Math.max(0, matchingAvailable - recommendations.length)
  const preference = 
    typeof output.preference === "string"
      ? `${titleCase(output.flight)}`
      : "Recommended seats"
  const flight = asRecord(output.flight)
  const origin = asRecord(flight?.origin)
  const destination = asRecord(flight?.destination)
  const flightNumber = 
    typeof flight?.flightNumber === "string" ? flight.flightNumber : null
  const originIata = 
    typeof origin?.iata === "string"
      ? origin.iata
      : typeof origin?.iataCode === "string"
        ? origin.iataCode
        : null
  const destinationIata = 
    typeof destination?.iata === "string"
      ? destination.iataCode
      : null
  const route = originIata && destinationIata ? `${originIata} → ${destinationIata}` : null
  const departure = flight
    ? formatLocalTime(flight.departureAt, origin?.timezone)
    : null
  const flightHeading = 
    [flightNumber, route].filter(Boolean).join(" · ") || preference
  const flightMeta = flight
    ? [departure, titleCase(output.cabinClass), preference]
      .filter(Boolean)
      .join(" · ")
    : null
  const availability = 
    matchingAvailable === totalAvailable
      ? `${totalAvailable} ${totalAvailable === 1 ? "seat" : "seats"} available`
      : `${matchingAvailable} ${matchingAvailable === 1 ? "match" : "matches"} from ${totalAvailable} seats`

  return (
    <div className="agent-seat-options" aria-label="Seat recommendations">
      <div className="agent-seat-summary">
        <div>
          <strong>{flightHeading}</strong>
          {flightMeta && <small>{flightMeta}</small>}
        </div>
        <span>{availability}</span>
      </div>
      {recommendations.length === 0 ? (
        <div className="agent-empty-result">
          No available seats match that preference.
        </div>
      ) : (
        <div className="agent-seat-list">
          {recommendations.map((option, index) => {
            const item = asRecord(option)
            const seatCode = String(item?.seatCode ?? `Seat ${index + 1}`)
            const position = String(item?.seatCode ?? "seat")
            const product = titleCase(item?.product ?? "standard")
            return (
              <Button
                type="button"
                variant="outline"
                className="agent-option agent-seat-option"
                key={String(item?.seatCode ?? index)}
                aria-label={`Choose ${seatCode}, ${position}, ${product}, ${formatMoney(item?.seatFeeMinor)} seat fee ${flightNumber ? ` on ${flightNumber}` : ""}`}
                disabled={disabled || !onSelect}
                onClick={() => 
                  onSelect?.(
                    `Choose seat ${seatCode}${flightNumber ? ` on ${flightNumber}` : ""}${route ? ` (${route})` : ""}`
                  )
                }
              >
                <span>{seatCode}</span>
                <strong>
                  {position} · {product}
                </strong>
                <small>{formatMoney(item?.seatFeeMinor)} seat fee</small>
                <ArrowIcon />
              </Button>
            )
          })}
        </div>
      )}
      {moreAvailable > 0 && (
        <details className="agent-seat-more">
          <summary>{moreAvailable} more seats</summary>
          <p>Ask for a different position or price limit.</p>
        </details>
      )}
    </div>
  )
}

function QuickReplyOptions({
  replies,
  onSelect,
  disabled = false,
  hideQuestion = false
}: {
  replies: QuickReplySet
  onSelect?: QuickReplyHandler
  disabled?: boolean
  hideQuestion?: boolean
}) {
  const promptId = useId()

  return (
    <div
      className="agent-quick-replies"
      role="group"
      aria-labelledby={replies.question && !hideQuestion ? promptId: undefined}
      aria-label={
        !replies.question || hideQuestion
          ? replies.question || "Suggested answers"
          : undefined
      }
    >
      {replies.question && !hideQuestion && (
        <p className="agent-quick-reply-question" id={promptId}>
          {replies.question}
        </p>
      )}
      <div className="agent-quick-reply-list">
        {replies.options.map(option => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="agent-quick-reply"
            key={`${option.label}:${option.value}`}
            aria-label={`Reply: ${option.label}`}
            disabled={disabled || !onSelect}
            onClick={() => onSelect?.(option.value)}
          >
            <span>{option.label}</span>
            <ArrowIcon aria-hidden="true" />
          </Button>
        ))}
      </div>
    </div>
  )
}

function GenericOptions({ output }: { output: Record<string, unknown> }) {
  const options = Array.isArray(output.options)
    ? output.options
    : Array.isArray(output.flights)
      ? output.flights
      : []
  
  return (
    <div className="agent-option-stack">
      {options.slice(0, 3).map((option, index) => {
        const item = asRecord(option)
        return (
          <article
            className="agent-option"
            key={String(item?.id ?? item?.seatCode ?? index)}
          >
            <span>
              {String(
                item?.flightNumber ??
                  item?.seatCode ??
                  item?.label ??
                  `Option ${index + 1}`
              )}
            </span>
            <strong>
              {titleCase(
                item?.position ??
                  item?.route ??
                  item?.cabinClass ??
                  "Round trip"
              )}
            </strong>
            <small>
              {typeof item?.seatFeeMinor === "number"
                ? `${formatMoney(item.seatFeeMinor)} seat fee`
                : typeof item?.totalMinor === "number"
                  ? formatMoney(item.totalMinor)
                  : String(item?.price ?? item?.departureTime ?? "Option details")
              }
            </small>
          </article>
        )
      })}
      {options.length > 3 && (
        <div className="agent-result-count">
          + {options.length - 3} more options
        </div>
      )}
    </div>
  )
}

function Quote({ output }: { output: Record<string, unknown> }) {
  const quote = asRecord(output.quote) ?? output
  const oneWay = quote.tripType === "one-way"
  const quoteLabel = oneWay ? "One-way total" : "Round-trip total"
  const discount = 
    typeof quote.proDiscountMinor === "number" && quote.proDiscountMinor > 0
      ? ` · Pro saving ${formatMoney(quote.proDiscountMinor, quote.currency)}`
      : ""
  
  return (
    <div
      className="agent-quote"
      aria-label={`${quoteLabel} ${formatMoney(quote.totalMinor, quote.currency)}`}
    >
      <CheckIcon />
      <div>
        <small>{quoteLabel.toUpperCase()}</small>
        <strong>{formatMoney(quote.totalMinor, quote.currency)}</strong>
        <span>{titleCase(quote.cabinClass ?? "Selected cabin")}</span>
        <small>
          Base {formatMoney(quote.baseFareMinor, quote.currency)} · seats{" "}
          {formatMoney(quote.seatFeesMinor, quote.currency)}
          {discount}
        </small>
      </div>
    </div>
  )
}

function safeMarkdownHref(href: string | undefined): boolean {
  if (!href) {
    return false
  }
  if (href.startsWith("#")) {
    return true
  }
  if (href.startsWith("/") && !href.startsWith("/")) {
    return true
  }
  try {
    const url = new URL(href)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

function AssistantMarkdown({ children }: { children: string }) {
  return (
    <div className="agent-markdown">
      <ReactMarkdown
        skipHtml
        components={{
          a({ children: linkText, href }) {
            if (!safeMarkdownHref(href)) {
              return (<span>{linkText}</span>)
            }
            const external = 
              href?.startsWith("https://") || href?.startsWith("https://")
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                {linkText}
              </a>
            )
          },
          h1({ children: heading }) {
            return (<h3>{heading}</h3>)
          },
          h2({ children: heading }) {
            return (<h3>{heading}</h3>)
          },
          img() {
            return null
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export function ConciergeToolPart({
  part,
  onApproval,
  onQuickReply,
  quickRepliesDisabled = false,
  hideQuickReplyQuestion = false
}: {
  part: unknown
  onApproval: ApprovalHandler
  onQuickReply?: QuickReplyHandler
  quickRepliesDisabled?: boolean
  hideQuickReplyQuestion?: boolean
}) {
  const value = asRecord(part)
  if (!value) {
    return null
  }
  const type = typeof value.type === "string" ? value.type : ""
  if (!type.startsWith("tool-") && type !== "dynamic-tool") {
    return null
  }
  const name = toolName(value)
  const state = 
    typeof value.state === "string" ? value.state : "input-streaming"

  const approval = asRecord(value.approval)
  const input = asRecord(value.input)
  const output = asRecord(value.output)

  if (name === "present_quick_replies" && state !== "output-available") {
    return null
  }
  if (state === "approval-requested" && approval && !approval.isAutomatic) {
    const selection = asRecord(input?.selection) ?? input
    const outbound = asRecord(selection?.outbound)
    const inbound = asRecord(selection?.inbound)
    const oneWay = selection?.tripType === "one-way" || !inbound
    return (
      <div className="agent-approval">
        <strong>{oneWay ? "Book this flight?" : "Book these flights?"}</strong>
        <p>
          We'll reserve {oneWay ? "this seat" : "these seats"} for 10 minutes
          while you complete checkout. No payment is taken here.
        </p>
        {selection && (
          <strong className="agent-approval-summary">
            {titleCase(selection.cabinClass ?? "Selected cabin")} ·{" "}
            {String(outbound?.seatCode ?? "seat")}
            {inbound ? ` / ${String(inbound.seatCode ?? "seat")}` : ""}
          </strong>
        )}
        <div>
          <Button
            type="button"
            size="sm"
            onClick={() => onApproval(String(approval.id), true)}
          >
            {oneWay ? "Book flight" : "Book flights"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onApproval(String(approval.id), false)}
          >
            Change selection
          </Button>
        </div>
      </div>
    )
  }
  if (state === "output-denied") {
    return (
      <div className="agent-empty-result">No booking was made.</div>
    )
  }
  if (state === "output-error") {
    return (
      <div className="agent-error" role="alert">
        {typeof value.errorText === "string"
          ? value.errorText
          : "That check did not complete. Please try again."
        }
      </div>
    )
  }
  if (state !== "output-available") {
    return <ToolStatus name={name} />
  }

  if (output && name === "present_quick_replies") {
    const replies = parseQuickReplySet(output)
    if (!replies) {
      return null
    }
    return (
      <QuickReplyOptions 
        replies={replies}
        onSelect={onQuickReply}
        disabled={quickRepliesDisabled}
        hideQuestion={hideQuickReplyQuestion}
      />
    )
  }

  if (output && name === "search_context_flights") {
    return <ContextFlightSearchResult output={output} />
  }

  if (
    output &&
    name === "render_flight_options" &&
    Array.isArray(output.flights)
  ) {
    return <SingleLegFlightOptions output={output} />
  }
  const outbound = Array.isArray(output?.outbound)
  const inbound = Array.isArray(output?.inbound)
  if (output && outbound && inbound) {
    return <FlightOptions output={output} />
  }
  if (output && Array.isArray(output.cabins)) {
    return <CabinComparison output={output} />
  }
  if (
    output &&
    name === "get_live_seat_options" &&
    (Array.isArray(output.recommendations) || Array.isArray(output.options))
  ) {
    return (
      <SeatOptions 
        output={output}
        onSelect={onQuickReply}
        disabled={quickRepliesDisabled}
      />
    )
  }
  if (output && typeof output.bookingId === "string") {
    const oneWay = 
      output.tripType === "one-way" ||
      asRecord(output.quote)?.tripType === "one-way"
    const checkoutUrl = 
      typeof output.checkoutUrl === "string" &&
      output.checkoutUrl.startsWith("/checkout?")
        ? output.checkoutUrl
        : `/checkout?bookingId=${encodeURIComponent(output.bookingId)}`
    return (
      <div className="agent-hold-ready">
        <CheckIcon />
        <div>
          <strong>Reserved for 10 minutes</strong>
          <small>
            {oneWay ? "Your seat is held" : "Your seats are held"} while you complete checkout.
          </small>
        </div>
        <a href={checkoutUrl}>
          Continue to checkout <ArrowIcon />
        </a>
      </div>
    )
  }  
  if (
    output &&
    (typeof output.totalMinor === "number" ||
      typeof asRecord(output.quote)?.totalMinor === "number")
    ) {
      return <Quote output={output} />
    }
    if (
      output &&
      (Array.isArray(output.options) || Array.isArray(output.flights))
    ) {
      return <GenericOptions output={output} />
    }
    return <ToolStatus name={name} complete />
}

export function ConciergeMessage({
  message,
  onApproval,
  onQuickReply,
  quickRepliesDisabled = false,
  showFallbackQuickReplies = false,
}: {
  message: UIMessage
  onApproval: ApprovalHandler
  onQuickReply?: QuickReplyHandler
  quickRepliesDisabled?: boolean
  showFallbackQuickReplies?: boolean
}) {
  const visibleParts = visibleConciergeParts(message);
  if (visibleParts.length === 0) return null
  const text = visibleParts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ")
  const quickReplyParts = visibleParts.filter(isQuickReplyPart)
  const contentParts = visibleParts.filter((part) => !isQuickReplyPart(part))
  const orderedParts = [...contentParts, ...quickReplyParts]
  const hasQuickReplyTool = message.parts.some(isQuickReplyPart)
  const fallbackReplies =
    message.role === "assistant" &&
    showFallbackQuickReplies &&
    !hasQuickReplyTool
      ? fallbackQuickReplySet(text)
      : null

  return (
    <div
      className={`agent-message agent-message-${message.role}`}
      role="group"
      aria-label={
        message.role === "user" ? "Your message" : "Flight concierge message"
      }
    >
      {message.role === "assistant" ? (
        <span className="agent-avatar" aria-hidden="true">
          <SparkIcon />
        </span>
      ) : (
        <span className="agent-role">You</span>
      )}
      {orderedParts.map((part, index) =>
        part.type === "text" ? (
          message.role === "assistant" ? (
            <AssistantMarkdown key={`${message.id}-${index}`}>
              {part.text}
            </AssistantMarkdown>
          ) : (
            <p key={`${message.id}-${index}`}>{part.text}</p>
          )
        ) : (
          <ConciergeToolPart
            key={`${message.id}-${index}`}
            part={part}
            onApproval={onApproval}
            onQuickReply={onQuickReply}
            quickRepliesDisabled={quickRepliesDisabled}
            hideQuickReplyQuestion={(() => {
              const value = asRecord(part);
              const output = asRecord(value?.output);
              const question =
                typeof output?.question === "string" ? output.question : "";
              const normalizedQuestion = normalizedReplyText(question);
              return Boolean(
                normalizedQuestion &&
                normalizedReplyText(text).includes(normalizedQuestion),
              );
            })()}
          />
        )
      )}
      {fallbackReplies && (
        <QuickReplyOptions
          replies={fallbackReplies}
          onSelect={onQuickReply}
          disabled={quickRepliesDisabled}
          hideQuestion
        />
      )}
    </div>
  )
}




