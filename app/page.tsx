'use client'

import { useState, useCallback, useEffect } from 'react'
import { WorkOrderProvider } from '@/lib/work-order-context'
import { VoiceControlProvider, useVoiceControl, type PageType } from '@/lib/voice-control-context'
import { VoiceInputPage } from '@/components/voice-input-page'
import { RecognitionResultsPage } from '@/components/recognition-results-page'
import { WorkOrderPreviewPage } from '@/components/work-order-preview-page'
import { OrderSuccessPage } from '@/components/order-success-page'
import { ShimmerTransition } from '@/components/shimmer-transition'

function WorkOrderApp() {
  const [currentPage, setCurrentPage] = useState<PageType>('voice-input')
  const [showShimmer, setShowShimmer] = useState(false)
  const { setCurrentPage: setVoiceCurrentPage, setNavigationHandlers, clearTranscriptHistory } = useVoiceControl()

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
  }, [currentPage, setNavigationHandlers])

  const handleConfirmVoiceInput = () => {
    setShowShimmer(true)
  }

  const handleShimmerComplete = useCallback(() => {
    setShowShimmer(false)
    setCurrentPage('recognition')
  }, [])

  const handleNewOrder = useCallback(() => {
    clearTranscriptHistory()
    setCurrentPage('voice-input')
  }, [clearTranscriptHistory])

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
