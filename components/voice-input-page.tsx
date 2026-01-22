'use client'

import { ChevronLeft, Car, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VoiceSession } from '@/components/voice-session'
import { useVoiceControl } from '@/lib/voice-control-context'
import { demoVehicle } from '@/lib/work-order-data'

interface VoiceInputPageProps {
  onConfirm: () => void
}

export function VoiceInputPage({ onConfirm }: VoiceInputPageProps) {
  const { transcriptHistory, isConnected } = useVoiceControl()

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-card">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-foreground tracking-tight">智能工单录入</h1>
        <div className="w-9" />
      </div>

      {/* Vehicle Info Card */}
      <div className="mx-4 mt-4 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">车辆信息</p>
            <p className="text-sm font-medium text-foreground">{demoVehicle.model}</p>
          </div>
        </div>
        <div className="pl-[52px]">
          <p className="text-xs text-muted-foreground font-mono">VIN: {demoVehicle.vin}</p>
        </div>
      </div>

      {/* Voice Input Section Header */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">语音输入</span>
          {isConnected && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              实时识别中
            </span>
          )}
        </div>
      </div>

      {/* Voice Session Component */}
      <div className="flex-1 mx-4 mb-4 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <VoiceSession showTranscript={true} />
      </div>

      {/* Confirm Button */}
      <div className="px-4 py-4 bg-card border-t border-border">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-muted-foreground">
            已识别 <span className="text-primary font-semibold">{transcriptHistory.length}</span> 条记录
          </span>
          {isConnected && (
            <span className="text-xs text-muted-foreground">
              说"确认"跳转下一步
            </span>
          )}
        </div>
        <Button
          onClick={onConfirm}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          确认
        </Button>
      </div>
    </div>
  )
}
