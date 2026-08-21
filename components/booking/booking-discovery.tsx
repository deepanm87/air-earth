import { ShieldIcon } from "@/components/icons"
import { DepartureBoard } from "./departure-board"
import { HeroFlightPath } from "./hero-flight-path"
import styles from "./booking-hero.module.css"

export function BookingHero() {
  return (
    <section className={styles.hero}>
      <HeroFlightPath />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="home-hero-title">Where to <span>next?</span></h1>
          <p>Search the route. Choose the seat. Skip the usual noise.</p>
        </div>
        <DepartureBoard />
      </div>
    </section>
  )
}

export function ContextBoundaryStory() {
  return (
    <section className="context-story">
      <div className="context-story-copy">
        <span className="context-story-icon" aria-hidden="true"><ShieldIcon /></span>
        <p className="context-story-label">Sanity Context</p>
        <h2>Useful flight context. A clear data boundary.</h2>
        <p>
          The concierge searches published schedules, cabin details and travel policies. It checks live seat availability through a protected tool.
        </p>
      </div>
      <ul className="context-boundaries">
        <li><strong>Published content</strong><span>Routes, fares, cabins and policies</span></li>
        <li><strong>Live inventory</strong><span>Seat availability checked only when requested</span></li>
        <li><strong>Privea by design</strong><span>Passenger and booking records stay outside Context</span></li>
      </ul>
    </section>
  )
}

