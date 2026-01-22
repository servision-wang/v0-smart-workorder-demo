'use client'

import { useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { useRealtimeVoice } from '@/lib/use-realtime-voice'
import { useVoiceControl } from '@/lib/voice-control-context'

interface VoiceSessionProps {
  className?: string
  showTranscript?: boolean
  compact?: boolean
}

export function VoiceSession({ className = '', showTranscript = true, compact = false }: VoiceSessionProps) {
  const { transcript, transcriptHistory, isConnected, isListening } = useVoiceControl()
  const { status, error, connect, disconnect, toggle } = useRealtimeVoice()
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new transcript appears
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcriptHistory, transcript])

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return '正在连接...'
      case 'connected':
        return '已连接 - 请说话'
      case 'error':
        return error || '连接错误'
      default:
        return '点击麦克风开始'
    }
  }

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600'
      case 'connecting':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  if (compact) {
    // Compact mode - just a mic button
    return (
      <button
        onClick={toggle}
        disabled={status === 'connecting'}
        className={`p-3 rounded-xl transition-all duration-300 ${
          status === 'connected'
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse'
            : status === 'connecting'
            ? 'bg-yellow-500/20 text-yellow-600'
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        } ${className}`}
        title={getStatusText()}
      >
        {status === 'connecting' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === 'connected' ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </button>
    )
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card/50 border-b border-border">
        <div className="flex items-center gap-2">
          {status === 'connected' ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : status === 'connecting' ? (
            <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
          ) : status === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-muted-foreground" />
          )}
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        {status === 'connected' && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600">录音中</span>
          </div>
        )}
      </div>

      {/* Transcript display */}
      {showTranscript && (
        <div className="flex-1 overflow-auto p-4 min-h-[120px] max-h-[200px] bg-secondary/30">
          {transcriptHistory.length === 0 && !transcript ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {status === 'connected' ? '请说出您的维修需求...' : '点击下方麦克风开始语音输入'}
            </p>
          ) : (
            <div className="space-y-2">
              {transcriptHistory.map((text, index) => (
                <div
                  key={index}
                  className="p-3 bg-card rounded-xl border border-border text-sm text-foreground"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 mr-2 rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  {text}
                </div>
              ))}
              {transcript && transcript !== transcriptHistory[transcriptHistory.length - 1] && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-sm text-foreground animate-pulse">
                  <span className="inline-flex items-center justify-center w-5 h-5 mr-2 rounded-md bg-primary/20 text-xs font-semibold text-primary">
                    {transcriptHistory.length + 1}
                  </span>
                  {transcript}
                  <span className="inline-block w-0.5 h-4 ml-1 bg-primary animate-pulse" />
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>
      )}

      {/* Mic button */}
      <div className="flex items-center justify-center p-4 bg-card border-t border-border">
        <button
          onClick={toggle}
          disabled={status === 'connecting'}
          className={`relative p-6 rounded-full transition-all duration-300 ${
            status === 'connected'
              ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/40'
              : status === 'connecting'
              ? 'bg-yellow-500/20 text-yellow-600'
              : status === 'error'
              ? 'bg-red-500/20 text-red-600'
              : 'bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-lg'
          }`}
        >
          {/* Pulse animation when connected */}
          {status === 'connected' && (
            <>
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
            </>
          )}

          {/* Icon */}
          <span className="relative z-10">
            {status === 'connecting' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : status === 'connected' ? (
              <Mic className="w-8 h-8" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </span>
        </button>
      </div>

      {/* Instructions */}
      <div className="px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          {status === 'connected'
            ? '说"确认"进入下一步，或描述您的维修需求'
            : status === 'connecting'
            ? '正在连接语音服务...'
            : '点击麦克风开始语音控制'}
        </p>
      </div>
    </div>
  )
}
