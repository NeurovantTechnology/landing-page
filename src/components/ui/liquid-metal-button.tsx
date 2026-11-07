"use client"

import * as React from "react"
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders"

type LiquidMetalButtonProps = {
  href: string
  label: string
  trailingMark?: string
}

export function LiquidMetalButton({ href, label, trailingMark }: LiquidMetalButtonProps) {
  const shaderRef = React.useRef<HTMLDivElement>(null)
  const shaderMount = React.useRef<ShaderMount | null>(null)
  const motionPreference = React.useRef<MediaQueryList | null>(null)
  const hovered = React.useRef(false)

  const setShaderSpeed = React.useCallback((speed: number) => {
    shaderMount.current?.setSpeed(motionPreference.current?.matches ? 0 : speed)
  }, [])

  React.useEffect(() => {
    const element = shaderRef.current
    if (!element) return

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    motionPreference.current = preference

    let mount: ShaderMount | null = null
    try {
      mount = new ShaderMount(
        element,
        liquidMetalFragmentShader,
        {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.3,
          u_shiftBlue: 0.3,
          u_distortion: 0,
          u_contour: 0,
          u_angle: 45,
          u_scale: 8,
          u_shape: 1,
          u_offsetX: 0.1,
          u_offsetY: -0.1,
        },
        undefined,
        0,
      )
      shaderMount.current = mount
    } catch (error) {
      console.error("Failed to initialize liquid metal button shader:", error)
    }

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      setShaderSpeed(event.matches ? 0 : hovered.current ? 1 : 0)
    }
    preference.addEventListener("change", onMotionPreferenceChange)

    return () => {
      preference.removeEventListener("change", onMotionPreferenceChange)
      mount?.dispose()
      shaderMount.current = null
      motionPreference.current = null
    }
  }, [setShaderSpeed])

  return (
    <a
      className="nv-liquid-button"
      href={href}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return
        hovered.current = true
        setShaderSpeed(1)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return
        hovered.current = false
        setShaderSpeed(0)
      }}
    >
      <div className="nv-liquid-button__surface" aria-hidden="true">
        <span className="nv-liquid-button__edge" />
        <div ref={shaderRef} className="nv-liquid-button__shader" />
        <span className="nv-liquid-button__inset" />
      </div>
      <span className="nv-liquid-button__label">
        {label}
        {trailingMark ? <span aria-hidden="true">{trailingMark}</span> : null}
      </span>
    </a>
  )
}
