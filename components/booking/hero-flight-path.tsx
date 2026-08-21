import { Plane } from "lucide-react"
import styles from "./booking-hero.module.css"

export function HeroFlightPath() {
  return (
    <div className={styles.flightPath} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path 
          className={styles.flightTrailHalo}
          d="M -8 79 C 19 71 31 50 48 39 S 78 18 108 25"
        />
        <path 
          className={styles.flightTrail}
          d="M -8 79 C 19 71 50 48 39 S 78 18 108 25"
        />
      </svg>
      <span className={styles.flightPlane}>
        <Plane fill="currentColor" stroke="none" />
      </span>
    </div>
  )
}