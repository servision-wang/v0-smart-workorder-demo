'use client'

import { ChevronLeft, Check, Search, ArrowLeftRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingVoiceButton } from '@/components/floating-voice-button'
import { useWorkOrder } from '@/lib/work-order-context'
import { demoVehicle, highlightedDescription } from '@/lib/work-order-data'
import { EPCCataloguePage } from './epc-catalogue-page'

interface RecognitionResultsPageProps {
  onBack: () => void
  onAddToWorkOrder: () => void
}

export function RecognitionResultsPage({ onBack, onAddToWorkOrder }: RecognitionResultsPageProps) {
  const {
    parts,
    togglePartSelection,
    togglePartAction,
    replacePart,
    epcOpen,
    epcPartId,
    openEpcForPart,
    closeEpc
  } = useWorkOrder()

  const selectedCount = parts.filter(p => p.selected).length

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
        <h1 className="flex-1 text-center font-semibold text-foreground tracking-tight">语音识别结果</h1>
        <div className="w-9" />
      </div>

      {/* Vehicle Info */}
      <div className="mx-4 mt-4 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">车辆</p>
            <p className="text-sm font-medium text-foreground">{demoVehicle.model}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{demoVehicle.vin}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Highlighted Description - Note: highlightedDescription is a static constant, safe for innerHTML */}
      <div className="mx-4 mt-3 p-4 bg-card rounded-xl border border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">识别内容</p>
        <p
          className="text-sm text-foreground leading-relaxed [&_.highlight]:text-primary [&_.highlight]:font-medium"
          dangerouslySetInnerHTML={{ __html: highlightedDescription }}
        />
      </div>

      {/* Parts List */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">配件列表</span>
          <span className="text-xs text-muted-foreground">{parts.length} 项</span>
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
                      // First action (更换) opens EPC catalogue
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
                  title="从EPC目录查找替换"
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
          <span className="text-sm text-muted-foreground">已选择 <span className="text-primary font-semibold">{selectedCount}</span> 项</span>
          <span className="text-xs text-muted-foreground">共 {parts.length} 项</span>
        </div>
        <Button
          onClick={onAddToWorkOrder}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          加入工单
        </Button>
      </div>

      {/* Floating Voice Button */}
      <FloatingVoiceButton
        hints={['选择进气格栅', '替换进气格栅', '全选', '加入工单', '返回']}
      />
    </div>
  )
}
