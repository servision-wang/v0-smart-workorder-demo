'use client'

import { CheckCircle, FileText, PlusCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { demoVehicle } from '@/lib/work-order-data'

interface OrderSuccessPageProps {
  onNewOrder: () => void
}

export function OrderSuccessPage({ onNewOrder }: OrderSuccessPageProps) {
  const orderNo = `WO${Date.now().toString().slice(-8)}`
  const currentTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-card">
        <div className="w-9" />
        <h1 className="flex-1 text-center font-semibold text-foreground tracking-tight">工单生成</h1>
        <div className="w-9" />
      </div>

      {/* Success Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">工单生成成功</h2>
        <p className="text-muted-foreground text-center mb-8">您的工单已成功生成，可以查看详情或继续创建新工单</p>

        {/* Order Info Card */}
        <div className="w-full bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 bg-secondary border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">工单编号</p>
                <p className="text-sm font-bold text-foreground font-mono">{orderNo}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">VIN码</span>
              <span className="text-sm font-medium text-foreground font-mono">{demoVehicle.vin}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">车型</span>
              <span className="text-sm font-medium text-foreground">{demoVehicle.model}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">创建时间</span>
              <span className="text-sm font-medium text-foreground">{currentTime}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">状态</span>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">待处理</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 space-y-3 bg-card border-t border-border">
        <Button
          variant="outline"
          className="w-full py-6 text-base font-semibold rounded-xl border-border bg-secondary text-foreground hover:bg-secondary/80 hover:border-primary/30 transition-all group"
        >
          <span>查看工单详情</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button
          onClick={onNewOrder}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          新建工单
        </Button>
      </div>
    </div>
  )
}
