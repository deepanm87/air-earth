"use client"

import { useEffect } from "react"
import { PlaneIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

export default function ErrorPage({ error, reset }: {
  error: Error & {
    digest?: string
  }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main-content" className="route-state route-state-error">
      <PlaneIcon />
      <span>Flight desk interrupted</span>
      <h1>We could not open this view.</h1>
      <p>Your booking has not been changed. Try the view again when you are ready.</p>
      <Button type="button" onClick={reset}>Try again</Button>
    </main>
  )
}