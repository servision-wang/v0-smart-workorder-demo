'use client'

import { useVoiceControl, type ConnectionStatus } from './voice-control-context'

interface UseRealtimeVoiceOptions {
  onTranscript?: (text: string) => void
  onToolCall?: (name: string, args: Record<string, unknown>) => void
  onError?: (error: string) => void
  onStatusChange?: (status: ConnectionStatus) => void
}

// Re-export ConnectionStatus for backward compatibility
export type { ConnectionStatus }

/**
 * Hook to access the voice control connection from context.
 * The actual WebRTC connection is managed at the VoiceControlProvider level
 * to persist across page transitions.
 */
export function useRealtimeVoice(_options: UseRealtimeVoiceOptions = {}) {
  const {
    connectionStatus,
    connectionError,
    isConnected,
    connect,
    disconnect,
    toggle,
  } = useVoiceControl()

  return {
    status: connectionStatus,
    error: connectionError,
    isConnected,
    isConnecting: connectionStatus === 'connecting',
    connect,
    disconnect,
    toggle,
    // sendTextMessage is no longer exposed - use context directly if needed
    sendTextMessage: () => {
      console.warn('sendTextMessage is deprecated - use context directly')
    },
  }
}
