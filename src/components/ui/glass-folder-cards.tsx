"use client"

import * as React from "react"

export type FolderFile = {
  category: string
  name: string
  meta: string
  href: string
  tone: "art" | "paper" | "note"
  ariaLabel: string
}

export type GlassFolderProps = {
  label: string
  meta: string
  files: FolderFile[]
}

export default function GlassFolder({ label, meta, files }: GlassFolderProps) {
  const folderRef = React.useRef<HTMLDivElement>(null)
  const faceRef = React.useRef<HTMLButtonElement>(null)
  const filesId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [hoverDismissed, setHoverDismissed] = React.useState(false)
  const closeFolder = React.useCallback(() => {
    setOpen(false)
    setHoverDismissed(true)
    faceRef.current?.focus()
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!folderRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setHoverDismissed(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFolder()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, closeFolder])

  return (
    <div className="nv-project-folder">
      <div
        ref={folderRef}
        className="nv-folder"
        data-open={open || undefined}
        data-hover-dismissed={hoverDismissed || undefined}
        onPointerLeave={() => setHoverDismissed(false)}
      >
        <span className="nv-folder__back-art" aria-hidden="true" />
        <div id={filesId} className="nv-folder__files" aria-label={`${label} project notes`} aria-hidden={!open} inert={!open}>
          {files.map((file) => (
            <a
              key={file.category}
              className={`nv-folder__sheet nv-folder__sheet--${file.tone}`}
              href={file.href}
              aria-label={file.ariaLabel}
            >
              <span>{file.category}</span>
              <strong>{file.name}</strong>
              <small>{file.meta}</small>
            </a>
          ))}
        </div>
        <button
          ref={faceRef}
          className="nv-folder__face"
          type="button"
          aria-label={`${label} project folder cover`}
          aria-expanded={open}
          aria-controls={filesId}
          onClick={() => {
            setOpen((value) => !value)
            setHoverDismissed(open)
          }}
        >
          <span className="nv-folder__front">
            <span className="nv-folder__label">
              <strong>{label}</strong>
              <small>{meta}</small>
            </span>
          </span>
        </button>
        <button
          className="nv-folder__key"
          type="button"
          aria-label={`Close ${label} project folder`}
          aria-controls={filesId}
          aria-hidden={!open}
          tabIndex={open ? 0 : -1}
          onClick={closeFolder}
        >
          +
        </button>
      </div>
    </div>
  )
}
