"use client"

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ArrowIcon, CloseIcon, MenuIcon, PlaneIcon, SparkIcon } from "./icons"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import styles from "./site-header.module.css"

const links = [
  {
    href: "/book",
    label: "Book"
  },
  {
    href: "/my-trips",
    label: "My trips"
  },
  {
    href: "/pro",
    label: "Pro"
  }
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const active = (href: string) => 
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.callsign} href="/" aria-label="AirEarth home">
          <span className={styles.callsign} aria-hidden="true">
            AE<span>/</span>
          </span>
          <span className={styles.brandCopy}>
            <strong>AirEarth</strong>
            <small>Flight booking</small>
          </span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {links.map(link => (
            <Link
              className={styles.navLink}
              key={link.href}
              href={link.href}
              aria-current={active(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.authActions}>
          <Show
            when="signed-in"
            fallback={(
              <>
                <SignInButton mode="modal">
                  <button className={styles.authAction} type="button">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className={styles.authActionStrong} type="button">Create account</button>
                </SignUpButton>
              </>
            )}
          >
            <Link
              className={styles.accountLink}
              href="/account"
              aria-current={active("/account") ? "page" : undefined}
            >
              Account
            </Link>
            <span className={styles.avatar}>
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link label="My trips" href="/my-trips" labelIcon={<PlaneIcon width={16} height={16} />} />
                  <UserButton.Link label="Billing" href="/account" labelIcon={<SparkIcon width={16} height={16} />} />
                </UserButton.MenuItems>
              </UserButton>
            </span>
          </Show>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className={styles.menuButton} type="button" aria-label="Open navigation menu">
              <MenuIcon />
              <span>Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className={styles.mobilePanel}
            overlayClassName={styles.mobileOverlay}
            showCloseButton={false}
          >
            <SheetHeader className={styles.mobilePanelHeader}>
              <SheetTitle className={styles.mobilePlanTitle}>Navigate</SheetTitle>
              <SheetClose asChild>
                <button className={styles.mobileClose} type="button" aria-label="Close navigation menu">
                  <CloseIcon />
                </button>
              </SheetClose>
            </SheetHeader>

            <nav className={styles.mobileNav} aria-label="Mobile navigation">
              {links.map(link => (
                <SheetClose asChild key={link.href}>
                  <Link href={link.href} aria-current={active(link.href) ? "page" : undefined}>
                    <span>{link.label}</span>
                    <ArrowIcon />
                  </Link>
                </SheetClose>
              ))}
              <Show when="signed-in">
                <SheetClose asChild>
                  <Link href="/account" aria-current={active("/account") ? "page" : undefined}>
                    <span>Account</span>
                    <ArrowIcon />
                  </Link>
                </SheetClose>
              </Show>
            </nav>

            <Show when="signed-out">
              <div className={styles.mobileAuthActions}>
                <SignInButton mode="modal">
                  <button className={styles.authAction} type="button">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className={styles.authActionStrong} type="button">Create account</button>
                </SignUpButton>
              </div>
            </Show>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}