'use client'

import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VehicleInfo } from '@/lib/work-order-data'

interface VehicleInfoPageProps {
  vehicleInfo: VehicleInfo
  onBack: () => void
  onContinue: () => void
}

export function VehicleInfoPage({ vehicleInfo, onBack, onContinue }: VehicleInfoPageProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-card">
        <button 
          onClick={onBack}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-foreground tracking-tight">Vehicle Identification</h1>
        <div className="w-9" />
      </div>

      {/* Vehicle Info Card */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          {/* VIN */}
          <div className="mb-5 pb-4 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1">Vehicle Identification No.</p>
            <p className="text-lg font-semibold text-foreground font-mono tracking-wide">{vehicleInfo.vin}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Brand */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Brand</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.brand}</p>
            </div>

            {/* Model Designation */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Model Designation</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.modelDesignation}</p>
            </div>

            {/* Production Date */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Date of production</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.productionDate}</p>
            </div>

            {/* Color */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Color</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.color}</p>
            </div>

            {/* Upholstery */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Upholstery</p>
              <p className="text-sm font-semibold text-foreground leading-tight">{vehicleInfo.upholstery}</p>
            </div>

            {/* Market Specification */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Market specification designation</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.marketSpecification}</p>
            </div>

            {/* Series */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Series</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.series}</p>
            </div>

            {/* Body */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Body</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.body}</p>
            </div>

            {/* Steering */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Steering</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.steering}</p>
            </div>

            {/* Doors */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Doors</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.doors}</p>
            </div>

            {/* Engine Code */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Engine Code</p>
              <p className="text-sm font-semibold text-foreground font-mono">{vehicleInfo.engineCode}</p>
            </div>

            {/* Displacement */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Displacement</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.displacement}</p>
            </div>

            {/* Power */}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Power</p>
              <p className="text-sm font-semibold text-foreground">{vehicleInfo.power}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 bg-card border-t border-border">
        <Button
          onClick={onContinue}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          To Voice Query
        </Button>
      </div>
    </div>
  )
}
