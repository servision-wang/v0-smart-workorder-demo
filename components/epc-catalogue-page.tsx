'use client'

import { useState } from 'react'
import { ChevronLeft, Search, ZoomIn, ZoomOut, RotateCcw, Check, Package, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingVoiceButton } from '@/components/floating-voice-button'
import { useWorkOrder, epcParts } from '@/lib/work-order-context'

interface EPCCataloguePageProps {
  partName: string
  onBack: () => void
  onSelectPart: (part: { name: string; partNo: string; price: number }) => void
}

export function EPCCataloguePage({ partName, onBack, onSelectPart }: EPCCataloguePageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [zoom, setZoom] = useState(100)
  const [showFilters, setShowFilters] = useState(false)

  // Use context for selection state (for voice control)
  const { selectedEpcPartId, setSelectedEpcPartId, confirmEpcSelection } = useWorkOrder()

  const filteredParts = epcParts.filter(part => 
    part.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectPart = () => {
    const part = epcParts.find(p => p.id === selectedEpcPartId)
    if (part) {
      // Use context's confirmEpcSelection which handles the replacement
      confirmEpcSelection()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-border bg-card">
        <button onClick={onBack} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-foreground tracking-tight">EPC 配件目录</h1>
        <div className="w-9" />
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-2 bg-card/50 border-b border-border overflow-x-auto">
        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <span>一汽-大众</span>
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          <span>Golf</span>
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          <span>2016</span>
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          <span className="text-primary font-medium">发动机缸体</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="px-4 py-3 bg-card border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索零件号或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>筛选</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <span className="text-xs text-muted-foreground">
            共 <span className="text-primary font-medium">{filteredParts.length}</span> 项
          </span>
        </div>
      </div>

      {/* Diagram Section - Collapsible on mobile */}
      <div className="border-b border-border bg-card/30">
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">爆炸图</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoom(100)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Simplified diagram representation for mobile */}
        <div className="h-40 mx-4 mb-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2306b6d4' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            transform: `scale(${zoom / 100})`
          }} />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border border-primary/30">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <span className="mt-2 text-xs text-muted-foreground">发动机缸体总成</span>
            <span className="text-[10px] text-muted-foreground/60">点击零件号查看位置</span>
          </div>
          {/* Callout markers */}
          <div className="absolute top-4 left-8 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">1</div>
          <div className="absolute top-12 right-12 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">2</div>
          <div className="absolute bottom-16 left-16 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">3</div>
          <div className="absolute bottom-8 right-8 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">4</div>
        </div>
      </div>

      {/* Parts Table */}
      <div className="flex-1 overflow-auto">
        <div className="px-4 py-2 bg-secondary/50 border-b border-border sticky top-0 z-10">
          <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-3">零件号</div>
            <div className="col-span-5">描述</div>
            <div className="col-span-2 text-right">价格</div>
            <div className="col-span-1 text-center">选</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {filteredParts.map((part) => (
            <button
              key={part.id}
              onClick={() => setSelectedEpcPartId(selectedEpcPartId === part.id ? null : part.id)}
              className={`w-full px-4 py-3 text-left transition-all ${
                selectedEpcPartId === part.id 
                  ? 'bg-primary/10 border-l-2 border-l-primary' 
                  : 'hover:bg-secondary/50'
              }`}
            >
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-secondary rounded text-[10px] font-medium text-muted-foreground">
                    {part.callNo}
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-mono text-primary">{part.partNo}</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">{part.group}</span>
                </div>
                <div className="col-span-5">
                  <span className="text-xs text-foreground line-clamp-2">{part.description}</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">{part.usage}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs font-medium text-foreground">¥{part.price.toFixed(0)}</span>
                  <span className="block text-[10px] text-muted-foreground">x{part.qty}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    selectedEpcPartId === part.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border border-muted-foreground/30'
                  }`}>
                    {selectedEpcPartId === part.id && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer with selection info */}
      <div className="px-4 py-4 border-t border-border bg-card">
        {selectedEpcPartId ? (
          <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">已选择</p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {epcParts.find(p => p.id === selectedEpcPartId)?.description}
                </p>
              </div>
              <span className="text-lg font-semibold text-primary">
                ¥{epcParts.find(p => p.id === selectedEpcPartId)?.price.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground mb-3">请从列表中选择一个配件</p>
        )}
        <Button
          onClick={handleSelectPart}
          disabled={!selectedEpcPartId}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          确认选择并替换
        </Button>
      </div>

      {/* Floating Voice Button */}
      <FloatingVoiceButton
        hints={['选择第一个', '选择活塞', '选择连杆', '确认选择', '返回']}
      />
    </div>
  )
}
