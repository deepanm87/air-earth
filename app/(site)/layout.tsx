import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { ConciergeDock } from "@/components/concierge/concierge-dock"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: {
    default: "AirEarth - Flight booking, cleared for takeoff",
    template: "%s · AirEarth"
  },
  description: 
    "Search one-way or round-trip flights, compare cabins, choose exact seats, and use a Sanity-powered AI flight concierge."
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#f15432",
          colorForeground: "#111820",
          colorBackground: "#ffffff",
          colorNeutral: "#66737c",
          borderRadius: "0.5rem",
          fontFamily: 
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", sans-serif'
        },
        elements: {
          cardBox: {
            borderRadius: "0.625rem",
            boxShadow: "0 18px 50px rgba(17, 24, 32, 0.12)"
          },
          card: {
            border: "1px solid #d8dee2",
            borderRadius: "0.625rem",
            boxShadow: "none"
          },
          headerTitle: { fontWeight: 720, letterSpacing: "-0.025em" },
          headSubtitle: { color: "#60738a" },
          socialButtonsBlockButton: { minHeight: "44px", borderRadius: "0.375rem" },
          formFieldInput: { minHeight: "44px", borderRadius: "0.375rem" },
          formButtonPrimary: {
            minHeight: "44px",
            borderRadius: "0.375rem",
            background: "#f15432",
            boxShadow: "none"
          },
          footerActionLink: { color: "#d94224", fontWeight: 700 },
          useButtonAvatarBox: { width: "36px", height: "36px" }
        }
      }}
    >
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="site-shell">
        <SiteHeader />
        {children}
        <ConciergeDock />
        <SiteFooter />
      </div>
    </ClerkProvider>
  )
}

