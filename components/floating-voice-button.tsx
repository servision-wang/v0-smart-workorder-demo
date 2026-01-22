'use client'

import { useState } from 'react'
import { Mic, MicOff, Loader2, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useVoiceControl } from '@/lib/voice-control-context'

interface FloatingVoiceButtonProps {
  hints?: string[]  // Voice command hints for current page
}

export function FloatingVoiceButton({ hints = [] }: FloatingVoiceButtonProps) {
  const {
    transcript,
    transcriptHistory,
    isConnected,
    connectionStatus,
    toggle
  } = useVoiceControl()
  const [expanded, setExpanded] = useState(false)

  // Get recent transcripts (last 3)
  const recentTranscripts = transcriptHistory.slice(-3)

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded panel */}
      {expanded && isConnected && (
        <div className="w-72 bg-card rounded-xl border border-border shadow-xl overflow-hidden animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-foreground">语音控制已启用</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="p-1 text-muted-foreground hover:text-foreground rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hints */}
          {hints.length > 0 && (
            <div className="px-3 py-2 border-b border-border bg-secondary/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">可用语音指令</p>
              <div className="flex flex-wrap gap-1">
                {hints.map((hint, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    "{hint}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent transcripts */}
          <div className="max-h-32 overflow-auto p-2">
            {recentTranscripts.length === 0 && !transcript ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                请说话...
              </p>
            ) : (
              <div className="space-y-1">
                {recentTranscripts.map((text, i) => (
                  <div key={i} className="text-xs text-muted-foreground p-1.5 bg-secondary/50 rounded">
                    {text}
                  </div>
                ))}
                {transcript && transcript !== recentTranscripts[recentTranscripts.length - 1] && (
                  <div className="text-xs text-foreground p-1.5 bg-primary/10 rounded animate-pulse">
                    {transcript}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle expand button (when connected) */}
      {isConnected && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 bg-card rounded-full border border-border shadow-lg text-muted-foreground hover:text-foreground"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      )}

      {/* Main mic button */}
      <button
        onClick={toggle}
        disabled={connectionStatus === 'connecting'}
        className={`p-4 rounded-full shadow-xl transition-all duration-300 ${
          connectionStatus === 'connected'
            ? 'bg-primary text-primary-foreground shadow-primary/40 scale-110'
            : connectionStatus === 'connecting'
            ? 'bg-yellow-500/20 text-yellow-600'
            : 'bg-card text-primary border border-border hover:bg-primary/10'
        }`}
      >
        {/* Pulse rings when connected */}
        {connectionStatus === 'connected' && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <span className="absolute inset-1 rounded-full bg-primary/20 animate-pulse" />
          </>
        )}

        <span className="relative z-10">
          {connectionStatus === 'connecting' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : connectionStatus === 'connected' ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </span>
      </button>

      {/* Status text */}
      <div className="text-[10px] text-muted-foreground text-right">
        {connectionStatus === 'connected' ? '说话中...' : connectionStatus === 'connecting' ? '连接中...' : '点击开启'}
      </div>
    </div>
  )
}
