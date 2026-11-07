import * as React from "react"
import { createRoot } from "react-dom/client"
import { LiquidMetalButton } from "../components/ui/liquid-metal-button"

export function mountHeroActions(element: HTMLElement) {
  createRoot(element).render(
    <>
      <LiquidMetalButton href="#projects" label="Explore Projects" trailingMark="↓" />
      <LiquidMetalButton href="#about" label="About Neurovant" trailingMark="↗" />
    </>,
  )
}
