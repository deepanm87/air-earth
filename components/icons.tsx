import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export function PlaneIcon(props: IconProps) { return <svg {...base} {...props}><path d="M22 2 9.7 14.3" /><path d="m22 2-7 20-4-8-8-4Z" /></svg>; }
export function ArrowIcon(props: IconProps) { return <svg {...base} {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>; }
export function ChevronIcon(props: IconProps) { return <svg {...base} {...props}><path d="m9 18 6-6-6-6" /></svg>; }
export function CalendarIcon(props: IconProps) { return <svg {...base} {...props}><path d="M8 2v4M16 2v4M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="2" /></svg>; }
export function LocationIcon(props: IconProps) { return <svg {...base} {...props}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>; }
export function SparkIcon(props: IconProps) { return <svg {...base} {...props}><path d="m12 3-1.4 4.1a5.3 5.3 0 0 1-3.4 3.4L3 12l4.2 1.5a5.3 5.3 0 0 1 3.4 3.4L12 21l1.4-4.1a5.3 5.3 0 0 1 3.4-3.4L21 12l-4.2-1.5a5.3 5.3 0 0 1-3.4-3.4Z" /></svg>; }
export function CheckIcon(props: IconProps) { return <svg {...base} {...props}><path d="m5 12 4 4L19 6" /></svg>; }
export function ClockIcon(props: IconProps) { return <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>; }
export function SeatIcon(props: IconProps) { return <svg {...base} {...props}><path d="M7 5v7a3 3 0 0 0 3 3h7" /><path d="M5 11H3v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4Z" /><path d="M17 15V9a2 2 0 0 1 4 0v5" /></svg>; }
export function UserIcon(props: IconProps) { return <svg {...base} {...props}><circle cx="12" cy="8" r="4" /><path d="M4 22c.7-4.5 3.3-7 8-7s7.3 2.5 8 7" /></svg>; }
export function TicketIcon(props: IconProps) { return <svg {...base} {...props}><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" /><path d="M13 6v2M13 11v2M13 16v2" /></svg>; }
export function MenuIcon(props: IconProps) { return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>; }
export function CloseIcon(props: IconProps) { return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>; }
export function ShieldIcon(props: IconProps) { return <svg {...base} {...props}><path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></svg>; }