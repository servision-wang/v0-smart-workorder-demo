'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { demoParts, demoLaborItems, type Part, type LaborItem } from './work-order-data'

interface WorkOrderContextType {
  parts: Part[]
  laborItems: LaborItem[]
  setParts: (parts: Part[]) => void
  setLaborItems: (items: LaborItem[]) => void
  togglePartSelection: (id: string) => void
  togglePartAction: (id: string, action: '更换' | '钣金' | '喷漆') => void
  updatePartQuantity: (id: string, quantity: number) => void
  updateLaborHours: (id: string, hours: number) => void
  getSelectedParts: () => Part[]
  getTotalPartsPrice: () => number
  getTotalLaborPrice: () => number
  getTotalPrice: () => number
}

const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined)

export function WorkOrderProvider({ children }: { children: ReactNode }) {
  const [parts, setParts] = useState<Part[]>(demoParts)
  const [laborItems, setLaborItems] = useState<LaborItem[]>(demoLaborItems)

  const togglePartSelection = (id: string) => {
    setParts(prev => prev.map(part => 
      part.id === id ? { ...part, selected: !part.selected } : part
    ))
  }

  const togglePartAction = (id: string, action: '更换' | '钣金' | '喷漆') => {
    setParts(prev => prev.map(part => {
      if (part.id !== id) return part
      const hasAction = part.selectedActions.includes(action)
      return {
        ...part,
        selectedActions: hasAction 
          ? part.selectedActions.filter(a => a !== action)
          : [...part.selectedActions, action]
      }
    }))
  }

  const updatePartQuantity = (id: string, quantity: number) => {
    setParts(prev => prev.map(part => 
      part.id === id ? { ...part, quantity: Math.max(1, quantity) } : part
    ))
  }

  const updateLaborHours = (id: string, hours: number) => {
    setLaborItems(prev => prev.map(item => 
      item.id === id ? { ...item, hours: Math.max(0, hours) } : item
    ))
  }

  const getSelectedParts = () => parts.filter(part => part.selected)

  const getTotalPartsPrice = () => 
    getSelectedParts().reduce((sum, part) => sum + part.price * part.quantity, 0)

  const getTotalLaborPrice = () => 
    laborItems.reduce((sum, item) => sum + item.hourlyRate * item.hours, 0)

  const getTotalPrice = () => getTotalPartsPrice() + getTotalLaborPrice()

  return (
    <WorkOrderContext.Provider value={{
      parts,
      laborItems,
      setParts,
      setLaborItems,
      togglePartSelection,
      togglePartAction,
      updatePartQuantity,
      updateLaborHours,
      getSelectedParts,
      getTotalPartsPrice,
      getTotalLaborPrice,
      getTotalPrice
    }}>
      {children}
    </WorkOrderContext.Provider>
  )
}

export function useWorkOrder() {
  const context = useContext(WorkOrderContext)
  if (!context) {
    throw new Error('useWorkOrder must be used within WorkOrderProvider')
  }
  return context
}
