'use client'

import { useState, useCallback } from 'react'
import { WorkOrderProvider } from '@/lib/work-order-context'
import { VoiceInputPage } from '@/components/voice-input-page'
import { RecognitionResultsPage } from '@/components/recognition-results-page'
import { WorkOrderPreviewPage } from '@/components/work-order-preview-page'
import { OrderSuccessPage } from '@/components/order-success-page'
import { ShimmerTransition } from '@/components/shimmer-transition'

type PageType = 'voice-input' | 'recognition' | 'preview' | 'success'

function WorkOrderApp() {
  const [currentPage, setCurrentPage] = useState<PageType>('voice-input')
  const [showShimmer, setShowShimmer] = useState(false)

  const handleConfirmVoiceInput = () => {
    setShowShimmer(true)
  }

  const handleShimmerComplete = useCallback(() => {
    setShowShimmer(false)
    setCurrentPage('recognition')
  }, [])

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
            onNewOrder={() => setCurrentPage('voice-input')}
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
    <WorkOrderProvider>
      <WorkOrderApp />
    </WorkOrderProvider>
  )
}
