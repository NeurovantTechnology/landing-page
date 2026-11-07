import * as React from "react"
import { createRoot } from "react-dom/client"
import GlassFolder, { type FolderFile } from "../components/ui/glass-folder-cards"

const files: FolderFile[] = [
  {
    category: "PROJECT OVERVIEW",
    name: "What we’re exploring",
    meta: "Product direction · early",
    href: "./projects/neurofit/",
    tone: "art",
    ariaLabel: "Read the NeuroPortal project overview",
  },
  {
    category: "CURRENT EXPLORATION",
    name: "Signals that may fit together",
    meta: "Messages · email · calendar · app use",
    href: "./projects/neurofit/",
    tone: "paper",
    ariaLabel: "Read what NeuroPortal is exploring",
  },
  {
    category: "PROJECT STATUS",
    name: "Still taking shape",
    meta: "No finished product or UI yet",
    href: "./projects/neurofit/",
    tone: "note",
    ariaLabel: "Read the current NeuroPortal project status",
  },
]

export function mountNeuroPortalFolder(element: HTMLElement) {
  createRoot(element).render(
    <GlassFolder label="NeuroPortal" meta="In development" files={files} />,
  )
}
