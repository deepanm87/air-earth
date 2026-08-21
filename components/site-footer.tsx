import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>AirEarth</strong>
          <p>Flight booking demo</p>
        </div>
        <div className="footer-links">
          <Link href="/book">Book</Link>
          <Link href="/my-trips">My trips</Link>
          <Link href="/pro">Pro</Link>
          <Link href="/account">Account</Link>
        </div>
        <p className="footer-note"><span>Demo only</span>No real payment or ticket is issued.</p>
      </div>
    </footer>
  )
}