import { ShieldIcon, SparkIcon } from "@/components/icons"

export function ConciergeEmptyState() {
  return (
    <div className="concierge-chat-empty">
      <div className="concierge-chat-empty-intro">
        <span className="concierge-chat-empty-icon" aria-hidden="true">
          <SparkIcon />
        </span>
        <div>
          <h3>How can I help with your trip?</h3>
          <p>
            Search for a flight or ask about changes, refunds, baggage, check-in, cabins, or seats.
          </p>
        </div>
      </div>

      <p className="concierge-chat-privacy">
        <ShieldIcon />
        <span>Passenger and payment details are entered at checkout.</span>
      </p>
    </div>
  )
}