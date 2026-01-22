'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { toolDefinitions, systemInstructions } from './tools-definition'

// Page types matching the app navigation
export type PageType = 'voice-input' | 'recognition' | 'preview' | 'success'

// Tool call result type
export interface ToolCallResult {
  success: boolean
  message: string
  data?: unknown
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// Voice control context interface
interface VoiceControlContextType {
  // Current page state
  currentPage: PageType
  setCurrentPage: (page: PageType) => void

  // Transcription state
  transcript: string
  setTranscript: (text: string) => void
  transcriptHistory: string[]
  addToTranscriptHistory: (text: string) => void
  clearTranscriptHistory: () => void

  // Connection state
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
  isListening: boolean
  setIsListening: (listening: boolean) => void

  // WebRTC connection management (lifted to context level)
  connectionStatus: ConnectionStatus
  connectionError: string | null
  connect: () => Promise<void>
  disconnect: () => void
  toggle: () => void

  // Navigation handlers (set by parent)
  navigationHandlers: {
    onConfirm: () => void
    onBack: () => void
    onNewOrder: () => void
  }
  setNavigationHandlers: (handlers: {
    onConfirm: () => void
    onBack: () => void
    onNewOrder: () => void
  }) => void

  // Work order handlers (set by WorkOrderProvider)
  workOrderHandlers: {
    togglePartSelection: (partName: string, selected?: boolean) => boolean
    togglePartAction: (partName: string, action: '更换' | '钣金' | '喷漆', enabled?: boolean) => boolean
    selectAllParts: (selected: boolean) => void
    updatePartQuantity: (partName: string, quantity: number | string) => boolean
    updateLaborHours: (laborName: string, hours: number | string) => boolean
    addRepairItems: (items: string) => void
    openEpc: (partName: string) => boolean
    // EPC selection handlers
    selectEpcPart: (callNo?: string, description?: string) => { success: boolean; partName?: string }
    confirmEpcSelection: () => boolean
  } | null
  setWorkOrderHandlers: (handlers: VoiceControlContextType['workOrderHandlers']) => void

  // Execute tool call
  executeToolCall: (toolName: string, args: Record<string, unknown>) => ToolCallResult
}

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined)

export function VoiceControlProvider({ children }: { children: ReactNode }) {
  // Page state
  const [currentPage, setCurrentPage] = useState<PageType>('voice-input')

  // Transcription state
  const [transcript, setTranscript] = useState('')
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([])

  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // WebRTC refs (persist across page transitions)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Handlers
  const navigationHandlersRef = useRef<VoiceControlContextType['navigationHandlers']>({
    onConfirm: () => {},
    onBack: () => {},
    onNewOrder: () => {},
  })
  const workOrderHandlersRef = useRef<VoiceControlContextType['workOrderHandlers']>(null)

  const setNavigationHandlers = useCallback((handlers: VoiceControlContextType['navigationHandlers']) => {
    navigationHandlersRef.current = handlers
  }, [])

  const setWorkOrderHandlers = useCallback((handlers: VoiceControlContextType['workOrderHandlers']) => {
    workOrderHandlersRef.current = handlers
  }, [])

  const addToTranscriptHistory = useCallback((text: string) => {
    if (text.trim()) {
      setTranscriptHistory(prev => [...prev, text.trim()])
    }
  }, [])

  const clearTranscriptHistory = useCallback(() => {
    setTranscriptHistory([])
  }, [])

  // Execute tool calls based on tool name and arguments
  const executeToolCall = useCallback((toolName: string, args: Record<string, unknown>): ToolCallResult => {
    console.log('Executing tool:', toolName, args)

    switch (toolName) {
      // Navigation tools
      case 'click_confirm': {
        navigationHandlersRef.current.onConfirm()
        return { success: true, message: '好的，已确认' }
      }

      case 'go_back': {
        navigationHandlersRef.current.onBack()
        return { success: true, message: '好的，已返回' }
      }

      case 'new_order': {
        navigationHandlersRef.current.onNewOrder()
        return { success: true, message: '好的，开始新工单' }
      }

      // Repair items
      case 'add_repair_items': {
        const items = args.items as string
        if (workOrderHandlersRef.current?.addRepairItems) {
          workOrderHandlersRef.current.addRepairItems(items)
          return { success: true, message: `已记录：${items}` }
        }
        // Even if no handler, still record in transcript
        addToTranscriptHistory(items)
        return { success: true, message: `已记录：${items}` }
      }

      // Part selection
      case 'toggle_part': {
        const partName = args.part_name as string
        const selectedArg = args.selected as string | undefined

        if (!workOrderHandlersRef.current?.togglePartSelection) {
          return { success: false, message: '当前页面无法操作配件' }
        }

        let selected: boolean | undefined
        if (selectedArg === 'true') selected = true
        else if (selectedArg === 'false') selected = false
        // 'toggle' or undefined = toggle

        const success = workOrderHandlersRef.current.togglePartSelection(partName, selected)
        if (success) {
          return { success: true, message: selected === false ? `已取消${partName}` : `已选择${partName}` }
        }
        return { success: false, message: `找不到配件：${partName}` }
      }

      case 'select_all_parts': {
        const selected = args.selected === 'true'

        if (!workOrderHandlersRef.current?.selectAllParts) {
          return { success: false, message: '当前页面无法操作配件' }
        }

        workOrderHandlersRef.current.selectAllParts(selected)
        return { success: true, message: selected ? '已全选' : '已取消全部' }
      }

      // Part actions
      case 'set_part_action': {
        const partName = args.part_name as string
        const action = args.action as '更换' | '钣金' | '喷漆'
        const enabledArg = args.enabled as string | undefined

        if (!workOrderHandlersRef.current?.togglePartAction) {
          return { success: false, message: '当前页面无法设置操作' }
        }

        let enabled: boolean | undefined
        if (enabledArg === 'true') enabled = true
        else if (enabledArg === 'false') enabled = false

        const success = workOrderHandlersRef.current.togglePartAction(partName, action, enabled)
        if (success) {
          return { success: true, message: `已设置${partName}${action}` }
        }
        return { success: false, message: `找不到配件：${partName}` }
      }

      // Open EPC catalogue
      case 'open_epc': {
        const partName = args.part_name as string

        if (!workOrderHandlersRef.current?.openEpc) {
          return { success: false, message: '当前页面无法打开EPC目录' }
        }

        const success = workOrderHandlersRef.current.openEpc(partName)
        if (success) {
          return { success: true, message: `好的，正在查找${partName}的替换件` }
        }
        return { success: false, message: `找不到配件：${partName}` }
      }

      // Select EPC part
      case 'select_epc_part': {
        const callNo = args.call_no as string | undefined
        const description = args.description as string | undefined

        if (!workOrderHandlersRef.current?.selectEpcPart) {
          return { success: false, message: 'EPC目录未打开' }
        }

        const result = workOrderHandlersRef.current.selectEpcPart(callNo, description)
        if (result.success) {
          return { success: true, message: `好的，已选择${result.partName}` }
        }
        return { success: false, message: '找不到该配件，请说出配件号或名称' }
      }

      // Confirm EPC selection
      case 'confirm_epc_selection': {
        if (!workOrderHandlersRef.current?.confirmEpcSelection) {
          return { success: false, message: 'EPC目录未打开' }
        }

        const success = workOrderHandlersRef.current.confirmEpcSelection()
        if (success) {
          return { success: true, message: '好的，已确认选择并替换' }
        }
        return { success: false, message: '请先选择一个配件' }
      }

      // Quantity adjustment
      case 'adjust_quantity': {
        const partName = args.part_name as string
        const quantity = args.quantity as string

        if (!workOrderHandlersRef.current?.updatePartQuantity) {
          return { success: false, message: '当前页面无法调整数量' }
        }

        const success = workOrderHandlersRef.current.updatePartQuantity(partName, quantity)
        if (success) {
          return { success: true, message: `已调整${partName}数量` }
        }
        return { success: false, message: `找不到配件：${partName}` }
      }

      // Labor hours adjustment
      case 'adjust_labor_hours': {
        const laborName = args.labor_name as string
        const hours = args.hours as string

        if (!workOrderHandlersRef.current?.updateLaborHours) {
          return { success: false, message: '当前页面无法调整工时' }
        }

        const success = workOrderHandlersRef.current.updateLaborHours(laborName, hours)
        if (success) {
          return { success: true, message: `已调整${laborName}工时` }
        }
        return { success: false, message: `找不到工时项：${laborName}` }
      }

      default:
        return { success: false, message: `未知工具：${toolName}` }
    }
  }, [addToTranscriptHistory])

  // Handle server events from data channel
  const handleServerEvent = useCallback((event: Record<string, unknown>) => {
    const eventType = event.type as string

    switch (eventType) {
      case 'session.created':
        console.log('Session created:', event)
        break

      case 'session.updated':
        console.log('Session updated:', event)
        break

      case 'conversation.item.input_audio_transcription.completed': {
        // User's speech transcribed
        const transcriptText = event.transcript as string
        console.log('Transcript:', transcriptText)
        setTranscript(transcriptText)
        addToTranscriptHistory(transcriptText)
        break
      }

      case 'response.audio_transcript.delta': {
        // AI response text (streaming)
        break
      }

      case 'response.audio_transcript.done': {
        // AI response text complete
        const transcriptText = event.transcript as string
        console.log('AI transcript:', transcriptText)
        break
      }

      case 'response.function_call_arguments.done': {
        // Tool call received
        const name = event.name as string
        const callId = event.call_id as string
        const argsStr = event.arguments as string

        console.log('Tool call:', name, argsStr)

        try {
          const args = JSON.parse(argsStr || '{}')

          // Execute the tool call
          const result = executeToolCall(name, args)
          console.log('Tool result:', result)

          // Send tool result back to OpenAI
          if (dataChannelRef.current?.readyState === 'open') {
            // Send function output
            dataChannelRef.current.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: callId,
                output: JSON.stringify(result),
              }
            }))

            // Request response (AI will speak confirmation)
            dataChannelRef.current.send(JSON.stringify({
              type: 'response.create'
            }))
          }
        } catch (err) {
          console.error('Tool call error:', err)
        }
        break
      }

      case 'error': {
        const errorMessage = (event.error as { message?: string })?.message || 'Unknown error'
        console.error('Server error:', errorMessage)
        setConnectionError(errorMessage)
        break
      }

      default:
        // Log other events for debugging
        if (eventType.startsWith('response.') || eventType.startsWith('conversation.')) {
          // console.log('Event:', eventType, event)
        }
    }
  }, [addToTranscriptHistory, executeToolCall])

  // Update status helper
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setConnectionStatus(newStatus)
    setIsConnected(newStatus === 'connected')
    setIsListening(newStatus === 'connected')
  }, [])

  // Connect to OpenAI Realtime API
  const connect = useCallback(async () => {
    if (peerConnectionRef.current) {
      console.log('Already connected')
      return
    }

    try {
      updateStatus('connecting')
      setConnectionError(null)

      // 1. Get ephemeral token from our API
      console.log('Fetching session token...')
      const tokenRes = await fetch('/api/realtime/session')
      if (!tokenRes.ok) {
        throw new Error('Failed to get session token')
      }
      const sessionData = await tokenRes.json()
      const ephemeralKey = sessionData.client_secret?.value

      if (!ephemeralKey) {
        throw new Error('No ephemeral key in response')
      }

      console.log('Got session token, creating peer connection...')

      // 2. Create peer connection
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // 3. Set up audio output (AI speaks)
      const audioEl = document.createElement('audio')
      audioEl.autoplay = true
      audioElementRef.current = audioEl

      pc.ontrack = (e) => {
        console.log('Received audio track')
        audioEl.srcObject = e.streams[0]
      }

      // 4. Add microphone input
      console.log('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      mediaStreamRef.current = stream
      pc.addTrack(stream.getTracks()[0])

      // 5. Set up data channel for events
      const dc = pc.createDataChannel('oai-events')
      dataChannelRef.current = dc

      dc.onopen = () => {
        console.log('Data channel open, configuring session...')

        // Configure session with tools and instructions
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: systemInstructions,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            tools: toolDefinitions,
          }
        }))

        updateStatus('connected')
      }

      dc.onmessage = (e) => {
        try {
          const eventData = JSON.parse(e.data)
          handleServerEvent(eventData)
        } catch (err) {
          console.error('Failed to parse event:', err)
        }
      }

      dc.onclose = () => {
        console.log('Data channel closed')
        updateStatus('disconnected')
      }

      dc.onerror = (e) => {
        console.error('Data channel error:', e)
        setConnectionError('Data channel error')
      }

      // 6. Create and send SDP offer
      console.log('Creating SDP offer...')
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 7. Send offer to OpenAI and get answer
      console.log('Sending offer to OpenAI...')
      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      )

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text()
        throw new Error(`SDP exchange failed: ${errorText}`)
      }

      // 8. Set remote description
      const answerSdp = await sdpResponse.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
      console.log('WebRTC connection established')

    } catch (err) {
      console.error('Connection error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Connection failed'
      setConnectionError(errorMessage)
      updateStatus('error')
      disconnect()
    }
  }, [updateStatus, handleServerEvent])

  // Disconnect from OpenAI
  const disconnect = useCallback(() => {
    console.log('Disconnecting...')

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // Clean up audio element
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null
      audioElementRef.current = null
    }

    updateStatus('disconnected')
    setConnectionError(null)
  }, [updateStatus])

  // Toggle connection
  const toggle = useCallback(() => {
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
      disconnect()
    } else {
      connect()
    }
  }, [connectionStatus, connect, disconnect])

  // Cleanup on provider unmount (app close)
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return (
    <VoiceControlContext.Provider value={{
      currentPage,
      setCurrentPage,
      transcript,
      setTranscript,
      transcriptHistory,
      addToTranscriptHistory,
      clearTranscriptHistory,
      isConnected,
      setIsConnected,
      isListening,
      setIsListening,
      connectionStatus,
      connectionError,
      connect,
      disconnect,
      toggle,
      navigationHandlers: navigationHandlersRef.current,
      setNavigationHandlers,
      workOrderHandlers: workOrderHandlersRef.current,
      setWorkOrderHandlers,
      executeToolCall,
    }}>
      {children}
    </VoiceControlContext.Provider>
  )
}

export function useVoiceControl() {
  const context = useContext(VoiceControlContext)
  if (!context) {
    throw new Error('useVoiceControl must be used within VoiceControlProvider')
  }
  return context
}
