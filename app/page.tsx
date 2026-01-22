'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { WorkOrderProvider, useWorkOrder, type ExtractedPartInput } from '@/lib/work-order-context'
import { VoiceControlProvider, useVoiceControl, type PageType } from '@/lib/voice-control-context'
import { VoiceInputPage } from '@/components/voice-input-page'
import { RecognitionResultsPage } from '@/components/recognition-results-page'
import { WorkOrderPreviewPage } from '@/components/work-order-preview-page'
import { OrderSuccessPage } from '@/components/order-success-page'
import { ShimmerTransition } from '@/components/shimmer-transition'

function WorkOrderApp() {
  const [currentPage, setCurrentPage] = useState<PageType>('voice-input')
  const [showShimmer, setShowShimmer] = useState(false)
  const { setCurrentPage: setVoiceCurrentPage, setNavigationHandlers, clearTranscriptHistory, transcriptHistory } = useVoiceControl()
  const { setExtractedParts } = useWorkOrder()

  // Track API completion for coordinating transition
  const extractedPartsRef = useRef<ExtractedPartInput[] | null>(null)
  const apiCompleteRef = useRef(false)
  const shimmerCompleteRef = useRef(false)

  // Transition to recognition when both API and shimmer are complete
  const tryCompleteTransition = useCallback(() => {
    if (apiCompleteRef.current && shimmerCompleteRef.current) {
      // Set extracted parts in context
      if (extractedPartsRef.current && extractedPartsRef.current.length > 0) {
        setExtractedParts(extractedPartsRef.current)
      }
      // Reset refs for next transition
      extractedPartsRef.current = null
      apiCompleteRef.current = false
      shimmerCompleteRef.current = false
      // Navigate to recognition page
      setShowShimmer(false)
      setCurrentPage('recognition')
    }
  }, [setExtractedParts])

  const handleConfirmVoiceInput = useCallback(async () => {
    // Reset transition state
    apiCompleteRef.current = false
    shimmerCompleteRef.current = false
    extractedPartsRef.current = null

    // Show shimmer immediately
    setShowShimmer(true)

    // Call API to extract parts from transcript
    const text = transcriptHistory.join(' ')
    if (text.trim()) {
      try {
        const response = await fetch('/api/extract-parts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
        if (response.ok) {
          const data = await response.json()
          extractedPartsRef.current = data.parts || []
        }
      } catch (error) {
        console.error('Failed to extract parts:', error)
      }
    }

    // Mark API as complete
    apiCompleteRef.current = true
    tryCompleteTransition()
  }, [transcriptHistory, tryCompleteTransition])

  const handleShimmerComplete = useCallback(() => {
    shimmerCompleteRef.current = true
    tryCompleteTransition()
  }, [tryCompleteTransition])

  const handleNewOrder = useCallback(() => {
    clearTranscriptHistory()
    setCurrentPage('voice-input')
  }, [clearTranscriptHistory])

  // Sync page state with voice control context
  useEffect(() => {
    setVoiceCurrentPage(currentPage)
  }, [currentPage, setVoiceCurrentPage])

  // Set up navigation handlers for voice control
  useEffect(() => {
    setNavigationHandlers({
      onConfirm: () => {
        // Handle confirm based on current page
        switch (currentPage) {
          case 'voice-input':
            handleConfirmVoiceInput()
            break
          case 'recognition':
            setCurrentPage('preview')
            break
          case 'preview':
            setCurrentPage('success')
            break
          case 'success':
            // On success page, "confirm" starts new order
            handleNewOrder()
            break
        }
      },
      onBack: () => {
        // Handle back based on current page
        switch (currentPage) {
          case 'recognition':
            setCurrentPage('voice-input')
            break
          case 'preview':
            setCurrentPage('recognition')
            break
          case 'success':
            setCurrentPage('preview')
            break
          default:
            // voice-input has no back
            break
        }
      },
      onNewOrder: handleNewOrder,
    })
  }, [currentPage, setNavigationHandlers, handleConfirmVoiceInput, handleNewOrder])

  const renderPage = () => {
    switch (currentPage) {
      case 'voice-input':
        return (
          <VoiceInputPage
            onConfirm={handleConfirmVoiceInput}
          />
        )
      case 'recognition':
        return (
          <RecognitionResultsPage
            onBack={() => setCurrentPage('voice-input')}
            onAddToWorkOrder={() => setCurrentPage('preview')}
          />
        )
      case 'preview':
        return (
          <WorkOrderPreviewPage
            onBack={() => setCurrentPage('recognition')}
            onGenerateOrder={() => setCurrentPage('success')}
          />
        )
      case 'success':
        return (
          <OrderSuccessPage
            onNewOrder={handleNewOrder}
          />
        )
    }
  }

  return (
    <div className="h-screen max-w-md mx-auto bg-background shadow-2xl shadow-black/50 relative overflow-hidden">
      {renderPage()}
      <ShimmerTransition
        isVisible={showShimmer}
        onComplete={handleShimmerComplete}
      />
    </div>
  )
}

export default function Home() {
  return (
    <VoiceControlProvider>
      <WorkOrderProvider>
        <WorkOrderApp />
      </WorkOrderProvider>
    </VoiceControlProvider>
  )
}
