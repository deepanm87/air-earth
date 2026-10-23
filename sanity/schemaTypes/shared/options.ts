export const CABIN_CLASSES = [
  { title: "First Class", value: "first" },
  { title: "Business Class", value: "business" },
  { title: "Economy", value: "economy" }
]

export const SEAT_POSITIONS = [
  { title: "Window", value: "window" },
  { title: "Middle", value: "middle" },
  { title: "Aisle", value: "aisle" },
  { title: "Centre suite", value: "center-suite" }
]

export const SEAT_PRODUCTS = [
  { title: "Standard", value: "standard" },
  { title: "Extra legroom", value: "extra-legroom" },
  { title: "Lie-flat", value: "lie-flat" },
  { title: "Suite", value: "suite" }
]

export const CURRENCY_OPTIONS = [{ title: "USD", value: "USD" }]

export const cabinTitle = (value?: string) => 
  CABIN_CLASSES.find(option => option.value === value)?.title ?? "Unknown cabin"