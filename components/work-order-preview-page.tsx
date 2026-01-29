'use client'

import { ChevronLeft, Plus, Minus, Trash2, Package, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingVoiceButton } from '@/components/floating-voice-button'
import { useWorkOrder } from '@/lib/work-order-context'

interface WorkOrderPreviewPageProps {
  onBack: () => void
  onGenerateOrder: () => void
}

export function WorkOrderPreviewPage({ onBack, onGenerateOrder }: WorkOrderPreviewPageProps) {
  const { 
    vehicleInfo,
    getSelectedParts, 
    laborItems, 
    updatePartQuantity,
    updateLaborHours,
    getTotalPartsPrice,
    getTotalLaborPrice,
    getTotalPrice
  } = useWorkOrder()

  const selectedParts = getSelectedParts()

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-card">
        <button onClick={onBack} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-foreground tracking-tight">Work Order Preview</h1>
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
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {/* Parts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Parts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Subtotal: <span className="text-primary font-semibold">${getTotalPartsPrice().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </span>
              <button className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {selectedParts.map((part) => (
              <div key={part.id} className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{part.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{part.partNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Unit ${part.price.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-primary">${(part.price * part.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1 bg-secondary rounded-lg border border-border">
                    <button 
                      onClick={() => updatePartQuantity(part.id, part.quantity - 1)}
                      className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-lg transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-foreground min-w-[40px] text-center">
                      {part.quantity}
                    </span>
                    <button 
                      onClick={() => updatePartQuantity(part.id, part.quantity + 1)}
                      className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Labor Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Labor</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Subtotal: <span className="text-primary font-semibold">${getTotalLaborPrice().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </span>
              <button className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {laborItems.map((item) => (
              <div key={item.id} className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <span className="inline-block text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium mt-1">Replace</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">${item.hourlyRate.toFixed(2)}/hr</p>
                    <p className="text-sm font-semibold text-primary">${(item.hourlyRate * item.hours).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.hours}
                      onChange={(e) => updateLaborHours(item.id, parseFloat(e.target.value) || 0)}
                      className="w-16 px-3 py-2 text-sm text-center bg-secondary text-foreground rounded-lg border border-border outline-none focus:border-primary/50 transition-colors"
                      step="0.1"
                      min="0"
                    />
                    <span className="text-xs text-muted-foreground">hours</span>
                  </div>
                  <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border bg-card">
        <div className="flex items-center justify-between mb-4 p-3 bg-secondary rounded-xl">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-primary">
            ${getTotalPrice().toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <Button
          onClick={onGenerateOrder}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          Generate Work Order
        </Button>
      </div>

      {/* Floating Voice Button */}
      <FloatingVoiceButton
        hints={['Grille quantity 2', 'Windshield 3 hours', 'Generate order', 'Back']}
      />
    </div>
  )
}
