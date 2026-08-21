"use client"

import dynamic from "next/dynamic"
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore
} from "react"

import { CloseIcon, SparkIcon } from "@/components/icons"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"

const MOBILE_CONCIERGE_QUERY = "(max-width: 1100px)"

function subscribeToMobileViewport(onChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_CONCIERGE_QUERY)
  mediaQuery.addEventListener("change", onChange)
  return () => mediaQuery.removeEventListener("change", onChange)
}

function getMobileViewportSnapshot() {
  return window.matchMedia(MOBILE_CONCIERGE_QUERY).matches
}

function getServerMobileViewportSnapshot() {
  return false
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "textarea:not(:disabled)",
  "input:not(:disabled)",
  "select:not(:disabled)",
  "[tabIndex]:not([tabindex='-1'])"
].join(",")

function keepFocusInsideMobileSheet(event: ReactKeyboardEvent<HTMLDivElement>) {
  if (event.key !== "Tab") {
    return
  }
  const focusable = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(element => !element.hidden && element.getAttribute("aria-hidden") !== "true")
  const first = focusable.at(0)
  const last = focusable.at(-1)
  if (!first || !last) {
    return
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

const LazyConciergeChat = dynamic(
  () => import("@/components/concierge/concierge-chat").then(module => module.conciergeChat),
  {
    ssr: false,
    loading: () => (
      <div className="concierge-dock-loading" role="status">
        <span />
        Opening...
      </div>
    )
  }
)

export function ConciergeDock() {
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    getServerMobileViewportSnapshot
  )

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      setHasOpened(true)
    }
    setOpen(nextOpen)

    if (
      !nextOpen
      && typeof window !== "undefined"
      && window.location.hash === "#concierge"
    ) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`
      )
    }
  }, [])

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#concierge") {
        setHasOpened(true)
        setOpen(true)
      }
    }
    openFromHash()
    window.addEventListener("hashchange", openFromHash)
    return () => window.removeEventListener("hashchange", openFromHash)
  }, [])

  return (
    <Sheet modal={false} open={open} onOpenChange={handleOpenChange}>
      <div id="concierge" className="concierge-dock" data-state={open ? "open" : "closed"}>
        <SheetTrigger asChild>
          <button
            ref={triggerRef}
            className="concierge-dock-trigger"
            type="button"
            aria-label={`${open ? "Close" : "Open"} flight concierge`}
          >
            <span className="concierge-dock-trigger-icon"><SparkIcon /></span>
            <span className="concierge-dock-trigger-copy">
              <strong>Flight concierge</strong>
              <small>{open ? "Minimize" : "Plan a trip"}</small>
            </span>
            <span className="concierge-dock-trigger-status" aria-hidden="true" />
          </button>
        </SheetTrigger>
      </div>

      <SheetContent
        side="right"
        showCloseButton={false}
        forceMount
        showOverlay={isMobileViewport}
        className="concierge-dock-surface"
        overlayClassName="concierge-dock-overlay"
        data-visibility={open ? "visible" : "hidden"}
        data-has-opened={hasOpened ? "true" : "false"}
        aria-hidden={!open}
        aria-model={isMobileViewport ? true : undefined}
        inert={open ? undefined : true}
        onInteractOutside={event => event.preventDefault()}
        onKeyDown={isMobileViewport ? keepFocusInsideMobileSheet : undefined}
        onCloseAutoFocus={event => {
          event.preventDefault()
          window.requestAnimationFrame(() => {
            if (triggerRef.current?.isConnected) {
              triggerRef.current.focus()
            }
          })
        }}
      >
        <SheetHeader className="concierge-dock-header">
          <div className="concierge-dock-brand">
            <span className="concierge-dock-brand-mark" aria-hidden="true"><SparkIcon /></span>
            <div className="concierge-dock-heading">
              <SheetTitle className="concierge-dock-title">Flight concierge</SheetTitle>
              <SheetDescription className="concierge-dock-description concierge-dock-context-status">
                <span className="concierge-dock-context-dot" aria-hidden="true" />
                Sanity Context · ready
              </SheetDescription>
            </div>
          </div>
          <SheetClose className="concierge-dock-close" aria-label="Close flight concierge">
            <CloseIcon />
          </SheetClose>
        </SheetHeader>
        <div className="concierge-dock-body">
          {hasOpened ? <LazyConciergeChat /> : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
