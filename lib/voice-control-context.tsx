'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'

// Page types matching the app navigation
export type PageType = 'home' | 'vehicle-info' | 'voice-input' | 'recognition' | 'preview' | 'success'

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

  // iFlytek WebSocket connection management
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
    togglePartAction: (partName: string, action: 'Replace' | 'Body Repair' | 'Paint', enabled?: boolean) => boolean
    selectAllParts: (selected: boolean) => void
    updatePartQuantity: (partName: string, quantity: number | string) => boolean
    updateLaborHours: (laborName: string, hours: number | string) => boolean
    addRepairItems: (items: string) => void
    openEpc: (partName: string) => boolean
    // EPC selection handlers
    selectEpcPart: (callNo?: string, partNo?: string, description?: string) => { success: boolean; partName?: string }
    confirmEpcSelection: () => boolean
  } | null
  setWorkOrderHandlers: (handlers: VoiceControlContextType['workOrderHandlers']) => void

  // Execute tool call (for voice commands - currently manual parsing)
  executeToolCall: (toolName: string, args: Record<string, unknown>) => ToolCallResult
}

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined)

// iFlytek transcript segment interface
interface TranscriptSegment {
  segId: number
  text: string
  isFinal: boolean
}

// Convert Float32Array to Int16Array (PCM 16-bit)
function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}

export function VoiceControlProvider({ children }: { children: ReactNode }) {
  // Page state
  const [currentPage, setCurrentPage] = useState<PageType>('home')

  // Transcription state
  const [transcript, setTranscript] = useState('')
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([])

  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // iFlytek WebSocket refs
  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const segmentsRef = useRef<Map<number, TranscriptSegment>>(new Map())
  
  // Current partial transcript for display
  const currentPartialRef = useRef<string>('')

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
    segmentsRef.current.clear()
    currentPartialRef.current = ''
  }, [])

  // Execute tool calls based on tool name and arguments
  const executeToolCall = useCallback((toolName: string, args: Record<string, unknown>): ToolCallResult => {
    console.log('Executing tool:', toolName, args)

    switch (toolName) {
      // Navigation tools
      case 'click_confirm': {
        navigationHandlersRef.current.onConfirm()
        return { success: true, message: 'OK, confirmed' }
      }

      case 'go_back': {
        navigationHandlersRef.current.onBack()
        return { success: true, message: 'OK, going back' }
      }

      case 'new_order': {
        navigationHandlersRef.current.onNewOrder()
        return { success: true, message: 'OK, starting new work order' }
      }

      // Repair items
      case 'add_repair_items': {
        const items = args.items as string
        if (workOrderHandlersRef.current?.addRepairItems) {
          workOrderHandlersRef.current.addRepairItems(items)
          return { success: true, message: `Recorded: ${items}` }
        }
        // Even if no handler, still record in transcript
        addToTranscriptHistory(items)
        return { success: true, message: `Recorded: ${items}` }
      }

      // Part selection
      case 'toggle_part': {
        const partName = args.part_name as string
        const selectedArg = args.selected as string | undefined

        if (!workOrderHandlersRef.current?.togglePartSelection) {
          return { success: false, message: 'Cannot modify parts on current page' }
        }

        let selected: boolean | undefined
        if (selectedArg === 'true') selected = true
        else if (selectedArg === 'false') selected = false

        const success = workOrderHandlersRef.current.togglePartSelection(partName, selected)
        if (success) {
          return { success: true, message: selected === false ? `Deselected ${partName}` : `Selected ${partName}` }
        }
        return { success: false, message: `Part not found: ${partName}` }
      }

      case 'select_all_parts': {
        const selected = args.selected === 'true'

        if (!workOrderHandlersRef.current?.selectAllParts) {
          return { success: false, message: 'Cannot modify parts on current page' }
        }

        workOrderHandlersRef.current.selectAllParts(selected)
        return { success: true, message: selected ? 'All selected' : 'All deselected' }
      }

      // Part actions
      case 'set_part_action': {
        const partName = args.part_name as string
        const action = args.action as 'Replace' | 'Body Repair' | 'Paint'
        const enabledArg = args.enabled as string | undefined

        if (!workOrderHandlersRef.current?.togglePartAction) {
          return { success: false, message: 'Cannot set action on current page' }
        }

        let enabled: boolean | undefined
        if (enabledArg === 'true') enabled = true
        else if (enabledArg === 'false') enabled = false

        const success = workOrderHandlersRef.current.togglePartAction(partName, action, enabled)
        if (success) {
          return { success: true, message: `Set ${partName} to ${action}` }
        }
        return { success: false, message: `Part not found: ${partName}` }
      }

      // Open EPC catalogue
      case 'open_epc': {
        const partName = args.part_name as string

        if (!workOrderHandlersRef.current?.openEpc) {
          return { success: false, message: 'Cannot open EPC on current page' }
        }

        const success = workOrderHandlersRef.current.openEpc(partName)
        if (success) {
          return { success: true, message: `OK, finding replacement for ${partName}` }
        }
        return { success: false, message: `Part not found: ${partName}` }
      }

      // Select EPC part
      case 'select_epc_part': {
        const callNo = args.call_no as string | undefined
        const partNo = args.part_no as string | undefined
        const description = args.description as string | undefined

        if (!workOrderHandlersRef.current?.selectEpcPart) {
          return { success: false, message: 'EPC catalogue not open' }
        }

        const result = workOrderHandlersRef.current.selectEpcPart(callNo, partNo, description)
        if (result.success) {
          return { success: true, message: `OK, selected ${result.partName}` }
        }
        return { success: false, message: 'Part not found, please specify part number or name' }
      }

      // Confirm EPC selection
      case 'confirm_epc_selection': {
        if (!workOrderHandlersRef.current?.confirmEpcSelection) {
          return { success: false, message: 'EPC catalogue not open' }
        }

        const success = workOrderHandlersRef.current.confirmEpcSelection()
        if (success) {
          return { success: true, message: 'OK, selection confirmed and replaced' }
        }
        return { success: false, message: 'Please select a part first' }
      }

      // Quantity adjustment
      case 'adjust_quantity': {
        const partName = args.part_name as string
        const quantity = args.quantity as string

        if (!workOrderHandlersRef.current?.updatePartQuantity) {
          return { success: false, message: 'Cannot adjust quantity on current page' }
        }

        const success = workOrderHandlersRef.current.updatePartQuantity(partName, quantity)
        if (success) {
          return { success: true, message: `Adjusted ${partName} quantity` }
        }
        return { success: false, message: `Part not found: ${partName}` }
      }

      // Labor hours adjustment
      case 'adjust_labor_hours': {
        const laborName = args.labor_name as string
        const hours = args.hours as string

        if (!workOrderHandlersRef.current?.updateLaborHours) {
          return { success: false, message: 'Cannot adjust labor hours on current page' }
        }

        const success = workOrderHandlersRef.current.updateLaborHours(laborName, hours)
        if (success) {
          return { success: true, message: `Adjusted ${laborName} hours` }
        }
        return { success: false, message: `Labor item not found: ${laborName}` }
      }

      default:
        return { success: false, message: `Unknown tool: ${toolName}` }
    }
  }, [addToTranscriptHistory])

  // Update status helper
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setConnectionStatus(newStatus)
    setIsConnected(newStatus === 'connected')
    setIsListening(newStatus === 'connected')
  }, [])

  // Parse iFlytek response and extract text
  const parseTranscriptResult = useCallback((data: string) => {
    try {
      const result = JSON.parse(data)
      
      if (result.action === 'started') {
        console.log('[iFlytek] Session started:', result.sid)
        return
      }
      
      if (result.action === 'error') {
        console.error('[iFlytek] Error:', result.code, result.desc)
        setConnectionError(`Error ${result.code}: ${result.desc}`)
        return
      }
      
      if (result.action === 'result' && result.data) {
        // Parse the nested JSON in data field
        const dataObj = JSON.parse(result.data)
        
        // Extract text from the complex structure
        // Structure: cn.st.rt[].ws[].cw[].w
        if (dataObj.cn?.st?.rt) {
          let text = ''
          const isFinal = dataObj.cn.st.type === '0' // type 0 = final, 1 = intermediate
          const segId = dataObj.seg_id || 0
          
          for (const rt of dataObj.cn.st.rt) {
            for (const ws of rt.ws || []) {
              for (const cw of ws.cw || []) {
                // wp: n=normal word, p=punctuation, s=smoothing word (filler)
                if (cw.w && cw.wp !== 's') {
                  text += cw.w
                }
              }
            }
          }
          
          if (text) {
            // Store segment
            segmentsRef.current.set(segId, { segId, text, isFinal })
            
            if (isFinal) {
              // Final result - add to history
              addToTranscriptHistory(text)
              currentPartialRef.current = ''
              setTranscript('')
            } else {
              // Partial result - update current transcript
              currentPartialRef.current = text
              setTranscript(text)
            }
            
            console.log(`[iFlytek] Transcript (${isFinal ? 'final' : 'partial'}, seg ${segId}):`, text)
          }
        }
      }
    } catch (err) {
      console.error('[iFlytek] Failed to parse response:', err, data)
    }
  }, [addToTranscriptHistory])

  // Connect to iFlytek WebSocket
  const connect = useCallback(async () => {
    if (wsRef.current) {
      console.log('[iFlytek] Already connected')
      return
    }

    try {
      updateStatus('connecting')
      setConnectionError(null)
      segmentsRef.current.clear()

      // 1. Get auth URL from our API
      console.log('[iFlytek] Fetching authentication...')
      const authRes = await fetch('/api/xfyun/auth')
      if (!authRes.ok) {
        throw new Error('Failed to get iFlytek authentication')
      }
      const authData = await authRes.json()
      
      console.log('[iFlytek] Connecting to WebSocket...')
      
      // 2. Create WebSocket connection
      const ws = new WebSocket(authData.url)
      wsRef.current = ws
      
      ws.onopen = async () => {
        console.log('[iFlytek] WebSocket connected')
        
        // 3. Start microphone capture
        try {
          console.log('[iFlytek] Requesting microphone access...')
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
            }
          })
          mediaStreamRef.current = stream
          
          // Create AudioContext with 16kHz sample rate
          const audioContext = new AudioContext({ sampleRate: 16000 })
          audioContextRef.current = audioContext
          
          const source = audioContext.createMediaStreamSource(stream)
          
          // Create processor node
          const processor = audioContext.createScriptProcessor(2048, 1, 1)
          processorRef.current = processor
          
          let audioBuffer: Int16Array[] = []
          let bufferLength = 0
          const chunkSize = 1280 // ~40ms of 16kHz mono audio (1280 samples = 80ms, but we send bytes, so 1280 bytes = 640 samples = 40ms)
          
          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return
            
            const inputData = e.inputBuffer.getChannelData(0)
            const pcmData = floatTo16BitPCM(inputData)
            const int16Data = new Int16Array(pcmData)
            
            audioBuffer.push(int16Data)
            bufferLength += int16Data.length * 2 // length in bytes
            
            // Send in chunks of 1280 bytes (as per iFlytek spec: 40ms at 16kHz)
            while (bufferLength >= chunkSize) {
              // Combine buffer into one array
              const totalSamples = Math.floor(bufferLength / 2)
              const combined = new Int16Array(totalSamples)
              let offset = 0
              for (const chunk of audioBuffer) {
                combined.set(chunk, offset)
                offset += chunk.length
              }
              
              // Extract chunk to send (chunkSize bytes = chunkSize/2 samples)
              const samplesToSend = Math.floor(chunkSize / 2)
              const toSend = combined.slice(0, samplesToSend)
              ws.send(toSend.buffer)
              
              // Keep remainder
              const remainder = combined.slice(samplesToSend)
              audioBuffer = remainder.length > 0 ? [remainder] : []
              bufferLength = remainder.length * 2
            }
          }
          
          source.connect(processor)
          processor.connect(audioContext.destination)
          
          updateStatus('connected')
          console.log('[iFlytek] Audio capture started')
          
        } catch (micError) {
          console.error('[iFlytek] Microphone error:', micError)
          throw new Error('Failed to access microphone')
        }
      }
      
      ws.onmessage = (event) => {
        parseTranscriptResult(event.data)
      }
      
      ws.onerror = (event) => {
        console.error('[iFlytek] WebSocket error:', event)
        setConnectionError('WebSocket connection error')
      }
      
      ws.onclose = (event) => {
        console.log('[iFlytek] WebSocket closed:', event.code, event.reason)
        updateStatus('disconnected')
        
        // Clean up audio
        if (processorRef.current) {
          processorRef.current.disconnect()
          processorRef.current = null
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop())
          mediaStreamRef.current = null
        }
        wsRef.current = null
      }
      
    } catch (err) {
      console.error('[iFlytek] Connection error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Connection failed'
      setConnectionError(errorMessage)
      updateStatus('error')
      disconnect()
    }
  }, [updateStatus, parseTranscriptResult])

  // Disconnect from iFlytek
  const disconnect = useCallback(() => {
    console.log('[iFlytek] Disconnecting...')
    
    // Send end signal
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        // Send end marker as binary (JSON encoded)
        const endSignal = new TextEncoder().encode(JSON.stringify({ end: true }))
        wsRef.current.send(endSignal)
      } catch (e) {
        console.error('[iFlytek] Failed to send end signal:', e)
      }
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
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

  // Cleanup on provider unmount
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
