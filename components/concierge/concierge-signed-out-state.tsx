"use client"

import { SignInButton } from "@clerk/nextjs"
import { Plane } from "lucide-react"

import { ArrowIcon, SeatIcon, SparkIcon, TicketIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import styles from "./concierge-signed-out-state.module.css"

const ROUTE = ["L", "H", "R", "→", "C", "D", "G"] as const

export function ConciergeSignedOutState() {
  return (
    <section
      className={`${styles.root} concierge-signed-out`}
      aria-labelledby="concierge-access-title"
    >
      <div className={styles.preview} aria-hidden="true">
        <svg
          className={styles.routeArc}
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          <path d="M-8 45 C23 40 8 108 13" />
        </svg>
        <Plane className={styles.plane} fill="currentColor" stroke="none" />
        <span className={styles.previewLabel}>One message is enough</span>
        <div className={styles.flapRoute}>
          {ROUTE.map((character, index) => (
            <span
              key={`${character}-${index}`}
              className={character === "→" ? styles.flapArrow : undefined}
            >
              {character}
            </span>
          ))}
        </div>
        <p>London to Paris · in two days · around 9am · window preferred</p>
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>AirEarth Pro</p>
        <h2 id="concierge-access-title">Brief the flight desk.</h2>
        <p className={styles.lead}>
          Search published flights or ask about changes, refunds, baggage and check-in. Every answer comes from Sanity Context.
        </p>

        <ul className={styles.capabilities}>
          <li>
            <SparkIcon />
            <span>
              <strong>Sanity Context</strong>Searches published flights, fares and travel policies.
            </span>
          </li>
          <li>
            <SeatIcon />
            <span>
              <strong>Live seat check</strong>Confirm window, aisle and cabin availability.
            </span>
          </li>
          <li>
            <TicketIcon />
            <span>
              <strong>Private checkout</strong>Keeps passenger and payment details out of chat.
            </span>
          </li>
        </ul>
      </div>

      <footer className={styles.actions}>
        <SignInButton mode="modal">
          <Button type="button" size="lg" className={styles.signInButton}>
            Sign in to plan a trip <ArrowIcon />
          </Button>
        </SignInButton>
        <p>
          Concierge access is included with Pro · 20% off paid seat selection.
        </p>
      </footer>
    </section>
  )
}