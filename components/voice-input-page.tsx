'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, Plus, Mic, X, Car, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { demoVehicle, demoVoiceInputs, type VoiceInput } from '@/lib/work-order-data'

interface VoiceInputPageProps {
  onConfirm: () => void
}

export function VoiceInputPage({ onConfirm }: VoiceInputPageProps) {
  const [inputs, setInputs] = useState<VoiceInput[]>(demoVoiceInputs)
  const [isRecording, setIsRecording] = useState(false)
  const [inputText, setInputText] = useState('')
  const nextId = useRef(inputs.length + 1)

  const handleRemoveInput = (id: number) => {
    setInputs(prev => prev.filter(input => input.id !== id))
  }

  const handleAddInput = () => {
    if (inputText.trim()) {
      setInputs(prev => [...prev, { id: nextId.current++, text: inputText.trim() }])
      setInputText('')
    }
  }

  const handleMicClick = () => {
    setIsRecording(!isRecording)
    if (isRecording) {
      setTimeout(() => {
        setInputText('更换后保险杠。')
      }, 500)
    }
  }

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

      {/* Voice Inputs List */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Waves className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">语音识别记录</span>
        </div>
        <div className="space-y-2">
          {inputs.map((input, index) => (
            <div 
              key={input.id} 
              className="group flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <p className="flex-1 text-sm text-foreground leading-relaxed">{input.text}</p>
              <button 
                onClick={() => handleRemoveInput(input.id)}
                className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-secondary rounded-xl px-4 py-3 border border-border focus-within:border-primary/50 transition-colors">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddInput()}
              placeholder="可录入您需要的配件或工时"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button 
            onClick={handleAddInput}
            className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={handleMicClick}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isRecording 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse' 
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="px-4 py-4 bg-card border-t border-border">
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
