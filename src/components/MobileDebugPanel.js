"use client"

import { useCallback, useState } from "react"
//import MobileDebugPanel, { useMobileDebug } from "@/components/MobileDebugPanel"

export const useMobileDebug = () => {
  const [logs, setLogs] = useState([])

  const debugLog = useCallback((...args) => {
    const text = args
      .map((item) => {
        if (item instanceof Error) {
          return `${item.name}: ${item.message}\n${item.stack || ""}`
        }

        if (typeof item === "object" && item !== null) {
          try {
            return JSON.stringify(item, null, 2)
          } catch {
            return String(item)
          }
        }

        return String(item)
      })
      .join(" ")

    console.log(...args)

    setLogs((prev) => [...prev, text])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    debugLog,
    clearLogs,
  }
}

const MobileDebugPanel = ({ logs, onClear }) => {
  if (!logs || logs.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 z-[9999] max-h-72 w-full bg-black/85 text-white">
      <div className="flex items-center justify-between border-b border-white/20 px-2 py-1 text-[10px]">
        <span>Debug Log</span>

        <button
          type="button"
          className="rounded bg-white/20 px-2 py-0.5 text-white"
          onClick={onClear}
        >
          清空
        </button>
      </div>

      <pre
        className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words p-2 text-[10px]"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {logs.join("\n")}
      </pre>
    </div>
  )
}

export default MobileDebugPanel