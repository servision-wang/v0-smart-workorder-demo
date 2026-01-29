'use client'

import { useMemo } from 'react'
import { ChevronLeft, Check, Search, ArrowLeftRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingVoiceButton } from '@/components/floating-voice-button'
import { useWorkOrder } from '@/lib/work-order-context'
import { useVoiceControl } from '@/lib/voice-control-context'
import { EPCCataloguePage } from './epc-catalogue-page'

interface RecognitionResultsPageProps {
  onBack: () => void
  onAddToWorkOrder: () => void
}

export function RecognitionResultsPage({ onBack, onAddToWorkOrder }: RecognitionResultsPageProps) {
  const {
    parts,
    vehicleInfo,
    togglePartSelection,
    togglePartAction,
    replacePart,
    epcOpen,
    epcPartId,
    openEpcForPart,
    closeEpc
  } = useWorkOrder()
  const { transcriptHistory } = useVoiceControl()

  const selectedCount = parts.filter(p => p.selected).length

  // Create highlighted description from transcript and extracted parts (using React elements for safety)
  const highlightedElements = useMemo(() => {
    const text = transcriptHistory.join(' ')
    if (!text.trim()) return [<span key="empty">No recognition content</span>]

    // Collect all terms to highlight: part names, categories, and actions
    const partTerms = parts.flatMap(p => [p.name, p.category])
    const actionTerms = ['Replace', 'Body Repair', 'Paint', 'replace', 'repair', 'paint']
    const allTerms = [...new Set([...partTerms, ...actionTerms])]

    // Sort by length (longest first) to avoid partial matches
    allTerms.sort((a, b) => b.length - a.length)

    // Escape special regex characters
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Build regex pattern
    const pattern = allTerms.map(escapeRegex).join('|')
    if (!pattern) return [<span key="text">{text}</span>]

    // Split text by matches and create React elements
    const regex = new RegExp(`(${pattern})`, 'gi')
    const segments = text.split(regex)

    return segments.map((segment, index) => {
      if (!segment) return null
      const lowerSegment = segment.toLowerCase()
      const isAction = actionTerms.some(a => a.toLowerCase() === lowerSegment)
      const isPart = partTerms.some(p => p.toLowerCase() === lowerSegment)

      if (isAction) {
        return <span key={index} className="text-primary font-semibold">{segment}</span>
      }
      if (isPart) {
        return <span key={index} className="text-primary font-medium bg-primary/10 px-1 rounded">{segment}</span>
      }
      return <span key={index}>{segment}</span>
    })
  }, [transcriptHistory, parts])

  const handleOpenEPC = (partId: string) => {
    openEpcForPart(partId)
  }

  const handleSelectFromEPC = (newPart: { name: string; partNo: string; price: number }) => {
    if (epcPartId) {
      replacePart(epcPartId, newPart)
      closeEpc()
    }
  }

  // Show EPC catalogue when open
  if (epcOpen) {
    const currentPart = parts.find(p => p.id === epcPartId)
    return (
      <EPCCataloguePage
        partName={currentPart?.name || ''}
        onBack={closeEpc}
        onSelectPart={handleSelectFromEPC}
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-card">
        <button onClick={onBack} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-foreground tracking-tight">Recognition Results</h1>
        <div className="w-9" />
      </div>

      {/* Vehicle Info */}
      {vehicleInfo && (
        <div className="mx-4 mt-4 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Vehicle</p>
              <p className="text-sm font-medium text-foreground">{vehicleInfo.brand} {vehicleInfo.modelDesignation}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{vehicleInfo.vin}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      )}

      {/* Highlighted Description - Generated from transcript with part name highlighting */}
      <div className="mx-4 mt-3 p-4 bg-card rounded-xl border border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recognition Content</p>
        <p className="text-sm text-foreground leading-relaxed">
          {highlightedElements}
        </p>
      </div>

      {/* Parts List */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Parts List</span>
          <span className="text-xs text-muted-foreground">{parts.length} items</span>
        </div>
        <div className="space-y-2">
          {parts.map((part) => (
            <div
              key={part.id}
              className={`p-4 bg-card rounded-xl border transition-all ${
                part.selected
                  ? 'border-primary/50 shadow-lg shadow-primary/5'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => togglePartSelection(part.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    part.selected
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-muted-foreground/30 hover:border-primary/50'
                  }`}
                >
                  {part.selected && <Check className="w-3 h-3" />}
                </button>

                {/* Part Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {part.name}
                    </span>
                    <span className="text-xs text-muted-foreground">x{part.quantity}</span>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium">
                      {part.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{part.partNo}</p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    {part.actions.map((action, actionIndex) => {
                      // First action (Replace) opens EPC catalogue
                      const isReplaceAction = actionIndex === 0
                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (isReplaceAction) {
                              handleOpenEPC(part.id)
                            } else {
                              togglePartAction(part.id, action)
                            }
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                            isReplaceAction
                              ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                              : part.selectedActions.includes(action)
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                          }`}
                        >
                          {isReplaceAction ? `${action} →` : action}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* EPC Search/Replace Icon */}
                <button
                  onClick={() => handleOpenEPC(part.id)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors group relative"
                  title="Find replacement in EPC catalogue"
                >
                  <div className="relative">
                    <Search className="w-4 h-4" />
                    <ArrowLeftRight className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Selected <span className="text-primary font-semibold">{selectedCount}</span> items</span>
          <span className="text-xs text-muted-foreground">Total {parts.length} items</span>
        </div>
        <Button
          onClick={onAddToWorkOrder}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          Add to Work Order
        </Button>
      </div>

      {/* Floating Voice Button */}
      <FloatingVoiceButton
        hints={['Select front grille', 'Replace grille', 'Select all', 'Add to order', 'Back']}
      />
    </div>
  )
}
