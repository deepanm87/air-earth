"use client"

import { SplitFlapDisplay } from "@daformat/react-split-flap-display"
import { useEffect, useState, useSyncExternalStore } from "react"
import styles from "./booking-hero.module.css"

const ROUTE_LENGTH = 14

const ROUTES = [
  { 
    from: "LONDON",
    to: "PARIS"
  },
  { 
    from: "DUBAI",
    to: "LONDON"
  },
  {
    from: "PARIS",
    to: "LONDON"
  },
  {
    from: "LONDON",
    to: "DUBAI"
  }
] as const

const ROUTE_LABELS = ROUTES.map(({ from, to }) => 
  `${from} → ${to}`.slice(0, ROUTE_LENGTH).padEnd(ROUTE_LENGTH, " ")
)

const ROUTE_CHARACTERS = Array.from({ length: ROUTE_LENGTH }, (_, index) => 
[...new Set(["", ...ROUTE_LABELS.map(label => label[index])])].join("")
)

function subscribeToReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  )
}

function normalizeBoardText(value: string, length: number) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 :\-→]/g, "")
    .slice(0, length)
    .padEnd(length, " ")
}

function SplitFlapText({
  value,
  length,
  characters,
  reducedMotion,
  onFullyFlipped
}: {
  value: string
  length: number
  characters: string | string[]
  reducedMotion: boolean
  onFullyFlipped: () => void
}) {
  const normalized = normalizeBoardText(value, length)

  if (reducedMotion) {
    return (
      <span aria-hidden="true" className={styles.staticFlap}>
        {[...normalized].map((character, index) => (
          <span key={`${index}-${character}`} data-character={character}>
            {character === " " ? "/u00a0" : character}
          </span>
        ))}
      </span>
    )
  }

  return (
    <SplitFlapDisplay.Root 
      aria-hidden="true"
      className={styles.flap}
      value={normalized}
      length={length}
      characters={characters}
      flipDuration={540}
      crease={1}
      onFullyFlipped={onFullyFlipped}
    />
  )
}

export function DepartureBoard() {
  const reducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [settled, setSettled] = useState(false)
  const route = ROUTES[activeIndex]
  const routeLabel = `${route.from} → ${route.to}`

  useEffect(() => {
    if (reducedMotion || paused || !settled) {
      return
    }
    const timer = window.setTimeout(() => {
      setSettled(false)
      setActiveIndex(current => (current + 1) % ROUTES.length)
    }, 4_600)
    return () => window.clearTimeout(timer)
  }, [paused, reducedMotion, settled])

  return (
    <section
      className={styles.board}
      aria-label="Animated route ideas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="sr-only">Route ideas include London, Paris, and Dubai.</p>

      <div className={styles.boardStage} aria-hidden="true">
        <div className={styles.boardPerspective}>
          <SplitFlapText 
            value={routeLabel}
            length={ROUTE_LENGTH}
            characters={ROUTE_CHARACTERS}
            reducedMotion={reducedMotion}
            onFullyFlipped={() => setSettled(true)}
          />
        </div>
      </div>
    </section>
  )
}
