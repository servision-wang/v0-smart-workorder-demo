'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Cpu, Zap } from 'lucide-react'

interface ShimmerTransitionProps {
  isVisible: boolean
  onComplete: () => void
}

export function ShimmerTransition({ isVisible, onComplete }: ShimmerTransitionProps) {
  const [phase, setPhase] = useState<'enter' | 'processing' | 'exit'>('enter')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setPhase('enter')
      setProgress(0)
      return
    }

    // Enter phase
    const enterTimer = setTimeout(() => {
      setPhase('processing')
    }, 300)

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    // Exit phase
    const exitTimer = setTimeout(() => {
      setPhase('exit')
    }, 1800)

    // Complete
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 2200)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
      clearInterval(progressInterval)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background with shimmer */}
      <div className="absolute inset-0 bg-background">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        
        {/* Shimmer lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-shimmer-line"
              style={{
                top: `${12 + i * 12}%`,
                left: '-100%',
                right: '-100%',
                animationDelay: `${i * 150}ms`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/60 animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Center content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-500 ${
        phase === 'enter' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* AI Processing Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
            <Cpu className="w-10 h-10 text-primary animate-pulse" />
          </div>
          
          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-spin-slow">
            <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-primary" />
          </div>
          <div className="absolute inset-0 animate-spin-slow-reverse">
            <Zap className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 text-primary" />
          </div>
          
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">智能识别中</h2>
          <p className="text-sm text-muted-foreground">正在将语音内容转换为结构化工单...</p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/50 rounded-full transition-all duration-100 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Processing steps */}
        <div className="mt-6 space-y-2">
          {[
            { text: '解析语音内容', delay: 0 },
            { text: '匹配配件数据', delay: 400 },
            { text: '生成工单结构', delay: 800 },
          ].map((step, i) => (
            <div 
              key={i}
              className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                progress > (i + 1) * 30 ? 'text-primary' : 'text-muted-foreground'
              }`}
              style={{ transitionDelay: `${step.delay}ms` }}
            >
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                progress > (i + 1) * 30 ? 'bg-primary' : 'bg-muted-foreground/30'
              }`} />
              {step.text}
              {progress > (i + 1) * 30 && (
                <span className="text-primary animate-fade-in">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
