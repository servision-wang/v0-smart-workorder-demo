'use client'

import { useCallback, useRef, useState } from 'react'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface XfyunVoiceOptions {
  onTranscript?: (text: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onStatusChange?: (status: ConnectionStatus) => void
}

interface TranscriptSegment {
  segId: number
  text: string
  isFinal: boolean
}

/**
 * Hook to use iFlytek (科大讯飞) Real-time Speech Recognition API
 * Uses WebSocket protocol with PCM audio streaming
 */
export function useXfyunVoice(options: XfyunVoiceOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const segmentsRef = useRef<Map<number, TranscriptSegment>>(new Map())
  
  const { onTranscript, onError, onStatusChange } = options

  // Update status helper
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus)
    onStatusChange?.(newStatus)
  }, [onStatusChange])

  // Parse iFlytek response and extract text
  const parseTranscriptResult = useCallback((data: string) => {
    try {
      const result = JSON.parse(data)
      
      if (result.action === 'started') {
        console.log('[v0] iFlytek session started:', result.sid)
        return
      }
      
      if (result.action === 'error') {
        console.error('[v0] iFlytek error:', result.code, result.desc)
        setError(`Error ${result.code}: ${result.desc}`)
        onError?.(`Error ${result.code}: ${result.desc}`)
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
            
            // Call callback with the text
            onTranscript?.(text, isFinal)
            
            console.log(`[v0] Transcript (${isFinal ? 'final' : 'partial'}, seg ${segId}):`, text)
          }
        }
      }
    } catch (err) {
      console.error('[v0] Failed to parse iFlytek response:', err, data)
    }
  }, [onTranscript, onError])

  // Convert Float32Array to Int16Array (PCM 16-bit)
  const floatTo16BitPCM = useCallback((float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2)
    const view = new DataView(buffer)
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]))
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
    return buffer
  }, [])

  // Connect to iFlytek WebSocket
  const connect = useCallback(async () => {
    if (wsRef.current) {
      console.log('[v0] Already connected to iFlytek')
      return
    }

    try {
      updateStatus('connecting')
      setError(null)
      segmentsRef.current.clear()

      // 1. Get auth URL from our API
      console.log('[v0] Fetching iFlytek auth...')
      const authRes = await fetch('/api/xfyun/auth')
      if (!authRes.ok) {
        throw new Error('Failed to get iFlytek authentication')
      }
      const authData = await authRes.json()
      
      console.log('[v0] Connecting to iFlytek WebSocket...')
      
      // 2. Create WebSocket connection
      const ws = new WebSocket(authData.url)
      wsRef.current = ws
      
      ws.onopen = async () => {
        console.log('[v0] iFlytek WebSocket connected')
        
        // 3. Start microphone capture
        try {
          console.log('[v0] Requesting microphone access...')
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
          
          // Create processor node (buffer size 1280 samples = 40ms at 16kHz for mono)
          // But ScriptProcessorNode uses power-of-2 buffer sizes, so we use 2048 and chunk
          const processor = audioContext.createScriptProcessor(2048, 1, 1)
          processorRef.current = processor
          
          let audioBuffer: Int16Array[] = []
          let bufferLength = 0
          const chunkSize = 1280 // 40ms of 16kHz mono audio
          
          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return
            
            const inputData = e.inputBuffer.getChannelData(0)
            const pcmData = floatTo16BitPCM(inputData)
            const int16Data = new Int16Array(pcmData)
            
            audioBuffer.push(int16Data)
            bufferLength += int16Data.length
            
            // Send in chunks of ~1280 bytes (640 samples = 40ms)
            while (bufferLength >= chunkSize) {
              // Combine buffer into one array
              const combined = new Int16Array(bufferLength)
              let offset = 0
              for (const chunk of audioBuffer) {
                combined.set(chunk, offset)
                offset += chunk.length
              }
              
              // Extract chunk to send
              const toSend = combined.slice(0, chunkSize)
              ws.send(toSend.buffer)
              
              // Keep remainder
              const remainder = combined.slice(chunkSize)
              audioBuffer = remainder.length > 0 ? [remainder] : []
              bufferLength = remainder.length
            }
          }
          
          source.connect(processor)
          processor.connect(audioContext.destination)
          
          updateStatus('connected')
          console.log('[v0] Audio capture started')
          
        } catch (micError) {
          console.error('[v0] Microphone error:', micError)
          throw new Error('Failed to access microphone')
        }
      }
      
      ws.onmessage = (event) => {
        parseTranscriptResult(event.data)
      }
      
      ws.onerror = (event) => {
        console.error('[v0] iFlytek WebSocket error:', event)
        setError('WebSocket connection error')
        onError?.('WebSocket connection error')
      }
      
      ws.onclose = (event) => {
        console.log('[v0] iFlytek WebSocket closed:', event.code, event.reason)
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
      console.error('[v0] iFlytek connection error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Connection failed'
      setError(errorMessage)
      onError?.(errorMessage)
      updateStatus('error')
      disconnect()
    }
  }, [updateStatus, parseTranscriptResult, floatTo16BitPCM, onError])

  // Disconnect from iFlytek
  const disconnect = useCallback(() => {
    console.log('[v0] Disconnecting from iFlytek...')
    
    // Send end signal
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        // Send end marker as text
        wsRef.current.send(JSON.stringify({ end: true }))
      } catch (e) {
        console.error('[v0] Failed to send end signal:', e)
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
    setError(null)
  }, [updateStatus])

  // Toggle connection
  const toggle = useCallback(() => {
    if (status === 'connected' || status === 'connecting') {
      disconnect()
    } else {
      connect()
    }
  }, [status, connect, disconnect])

  // Get all final transcripts combined
  const getFinalTranscript = useCallback(() => {
    const segments = Array.from(segmentsRef.current.values())
      .filter(s => s.isFinal)
      .sort((a, b) => a.segId - b.segId)
    return segments.map(s => s.text).join('')
  }, [])

  return {
    status,
    error,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    connect,
    disconnect,
    toggle,
    getFinalTranscript,
  }
}
