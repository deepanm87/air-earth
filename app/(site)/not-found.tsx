import Link from "next/link"
import { PlaneIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main id="main-content" className="route-state">
      <PlaneIcon />
      <span>404 · Route not found</span>
      <h1>This destination is not on our map.</h1>
      <p>Return to the flight desk to search the available demo schedule.</p>
      <Button asChild><Link href="/">Return home</Link></Button>
    </main>
  )
}