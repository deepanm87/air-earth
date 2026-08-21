export default function Loading() {
  return (
    <main id="main-content" className="route-state" aria-live="polite" aria-busy="true">
      <span className="loading-orbit" />
      <p>Preparing your flight desk...</p>
    </main>
  )
}