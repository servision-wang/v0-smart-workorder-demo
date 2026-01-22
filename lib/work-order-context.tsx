'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { demoParts, demoLaborItems, type Part, type LaborItem } from './work-order-data'
import { useVoiceControl } from './voice-control-context'

// EPC Part definition (matches epc-catalogue-page.tsx)
export interface EPCPart {
  id: string
  callNo: number
  partNo: string
  group: string
  position: string
  description: string
  usage: string
  year: string
  qty: number
  price: number
}

// EPC parts data (shared with epc-catalogue-page.tsx)
export const epcParts: EPCPart[] = [
  { id: 'e1', callNo: 1, partNo: '12656876', group: '00.629', position: 'R', description: '活塞套件 ENG (INCLS 54,55) (STD SIZE)', usage: 'CK1 (06) (L84)', year: '2021-2025', qty: 4, price: 580.00 },
  { id: 'e2', callNo: 1, partNo: '12656877', group: '00.629', position: 'L', description: '活塞套件 ENG (INCL 54,55) (STD SIZE)', usage: 'CK1 (06) (L84)', year: '2021-2025', qty: 4, price: 580.00 },
  { id: 'e3', callNo: 1, partNo: '12659283', group: '00.629', position: 'L', description: '活塞套件 ENG (INCLS 54,55) (.5MM O/S)', usage: 'CK1 (06) (L84)', year: '2021-2025', qty: 4, price: 620.00 },
  { id: 'e4', callNo: 1, partNo: '12659284', group: '00.629', position: 'R', description: '活塞套件 ENG (INCLS 54,55) (.5MM O/S)', usage: 'CK1 (06) (L84)', year: '2021-2025', qty: 4, price: 620.00 },
  { id: 'e5', callNo: 2, partNo: '12691926', group: '00.643', position: '-', description: '活塞环套件 PSTN (STD SIZE)', usage: 'CK1 (06) (L84)', year: '2021-2025', qty: 8, price: 320.00 },
  { id: 'e6', callNo: 2, partNo: '12691927', group: '00.643', position: '-', description: '活塞环套件 PSTN (.5MM O/S)', usage: 'CK1 (06) (L84)', year: '2021-2025', qty: 1, price: 320.00 },
  { id: 'e7', callNo: 3, partNo: '12649190', group: '00.603', position: '-', description: '连杆 CONN (INCLS 4)', usage: 'CK1 (06) (L84)', year: '2021-2025', qty: 8, price: 450.00 },
  { id: 'e8', callNo: 4, partNo: '11570662', group: '00.623', position: '-', description: '连杆螺栓 (3件套) (M9X44,13) (一次性)', usage: 'CK1 (06) (L84)', year: '2021-2025', qty: 16, price: 85.00 },
  { id: 'e9', callNo: 5, partNo: 'NS', group: '-', position: '-', description: '轴承 CM/SHF (* KIT2)', usage: '-', year: '2021-2025', qty: 1, price: 280.00 },
  { id: 'e10', callNo: 6, partNo: '12679049', group: '00.539', position: '-', description: '轴承 CM/SHF (位置 #4 (V6) 或 #5 (V8))', usage: 'CK1 (06) (L84,L87)', year: '2021-2025', qty: 1, price: 320.00 },
  { id: 'e11', callNo: 7, partNo: '01453658', group: '00.685', position: '-', description: '定位销 TRANS LOC (5/8 X 1 3/16)', usage: 'CK1 (06) (L84,MHS)', year: '2023-2025', qty: 2, price: 45.00 },
  { id: 'e12', callNo: 8, partNo: '12661074', group: '01.531', position: '-', description: '机油道堵塞 ENG BLK OIL GAL (INCLS 9)', usage: 'CK1 (06) (L84,L87)', year: '2021-2025', qty: 1, price: 65.00 },
  { id: 'e13', callNo: 9, partNo: '12638432', group: '01.531', position: '-', description: '密封圈 ENG BLK OIL GAL PLUG O RING (一次性)', usage: 'CK1 (06)', year: '2021-2025', qty: 1, price: 28.00 },
  { id: 'e14', callNo: 10, partNo: '11546565', group: '00.056', position: '-', description: '曲轴皮带轮螺栓 CR/SHF BRG CAP (一次性)', usage: 'CK1 (L84,L87)', year: '2023-2025', qty: 10, price: 35.00 },
]

// Input type for extracted parts from AI
export interface ExtractedPartInput {
  name: string
  action: ('更换' | '钣金' | '喷漆')[]
  category: string
}

interface WorkOrderContextType {
  parts: Part[]
  laborItems: LaborItem[]
  setParts: (parts: Part[]) => void
  setLaborItems: (items: LaborItem[]) => void
  setExtractedParts: (extractedParts: ExtractedPartInput[]) => void
  togglePartSelection: (id: string) => void
  togglePartAction: (id: string, action: '更换' | '钣金' | '喷漆') => void
  updatePartQuantity: (id: string, quantity: number) => void
  updateLaborHours: (id: string, hours: number) => void
  replacePart: (id: string, newPart: { name: string; partNo: string; price: number }) => void
  getSelectedParts: () => Part[]
  getTotalPartsPrice: () => number
  getTotalLaborPrice: () => number
  getTotalPrice: () => number
  // Voice control helpers
  findPartByName: (name: string) => Part | undefined
  findLaborByName: (name: string) => LaborItem | undefined
  // EPC state (for voice control)
  epcOpen: boolean
  epcPartId: string | null
  openEpcForPart: (partId: string) => void
  closeEpc: () => void
  // EPC selection state
  selectedEpcPartId: string | null
  setSelectedEpcPartId: (id: string | null) => void
  confirmEpcSelection: () => void
}

const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined)

export function WorkOrderProvider({ children }: { children: ReactNode }) {
  const [parts, setParts] = useState<Part[]>(demoParts)
  const [laborItems, setLaborItems] = useState<LaborItem[]>(demoLaborItems)
  const [epcOpen, setEpcOpen] = useState(false)
  const [epcPartId, setEpcPartId] = useState<string | null>(null)
  const [selectedEpcPartId, setSelectedEpcPartId] = useState<string | null>(null)
  const { setWorkOrderHandlers } = useVoiceControl()

  // EPC state management
  const openEpcForPart = useCallback((partId: string) => {
    setEpcPartId(partId)
    setEpcOpen(true)
  }, [])

  const closeEpc = useCallback(() => {
    setEpcOpen(false)
    setEpcPartId(null)
    setSelectedEpcPartId(null)
  }, [])

  // Generate random part number in format "XXX XXX XXX"
  const generatePartNo = useCallback(() => {
    const seg1 = Math.floor(Math.random() * 900 + 100).toString()
    const seg2 = Math.floor(Math.random() * 900 + 100).toString()
    const seg3 = Math.floor(Math.random() * 900 + 100).toString()
    return `${seg1} ${seg2} ${seg3}`
  }, [])

  // Generate random price between min and max
  const generatePrice = useCallback((min: number, max: number) => {
    return Math.round((Math.random() * (max - min) + min) / 10) * 10
  }, [])

  // Set extracted parts from AI and generate corresponding labor items
  const setExtractedParts = useCallback((extractedParts: ExtractedPartInput[]) => {
    // Convert extracted parts to full Part objects
    const newParts: Part[] = extractedParts.map((ep, index) => ({
      id: `ai-${index + 1}`,
      name: ep.name,
      partNo: generatePartNo(),
      price: generatePrice(200, 2500),
      quantity: 1,
      category: ep.category || ep.name,
      actions: ['更换', '钣金', '喷漆'] as const,
      selectedActions: ep.action.length > 0 ? ep.action : ['更换'],
      selected: true,
    }))

    // Generate labor items based on parts and their actions
    const newLaborItems: LaborItem[] = []
    extractedParts.forEach((ep, index) => {
      const actions = ep.action.length > 0 ? ep.action : ['更换']
      actions.forEach((action, actionIndex) => {
        const baseHours = action === '更换' ? 1.5 : action === '钣金' ? 2.5 : 2.0
        const hours = Math.round((baseHours + Math.random() * 1.5) * 10) / 10
        newLaborItems.push({
          id: `labor-${index + 1}-${actionIndex}`,
          name: `${ep.name}${action}`,
          hourlyRate: 100,
          hours,
        })
      })
    })

    setParts(newParts)
    setLaborItems(newLaborItems)
  }, [generatePartNo, generatePrice])

  // Confirm EPC selection and replace the original part
  const confirmEpcSelection = useCallback(() => {
    if (!epcPartId || !selectedEpcPartId) return

    const epcPart = epcParts.find(p => p.id === selectedEpcPartId)
    if (!epcPart) return

    // Replace the original part with the selected EPC part
    setParts(prev => prev.map(part =>
      part.id === epcPartId
        ? { ...part, name: epcPart.description, partNo: epcPart.partNo, price: epcPart.price }
        : part
    ))

    // Close EPC and reset selection
    setEpcOpen(false)
    setEpcPartId(null)
    setSelectedEpcPartId(null)
  }, [epcPartId, selectedEpcPartId])

  const togglePartSelection = useCallback((id: string) => {
    setParts(prev => prev.map(part =>
      part.id === id ? { ...part, selected: !part.selected } : part
    ))
  }, [])

  const togglePartAction = useCallback((id: string, action: '更换' | '钣金' | '喷漆') => {
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
  }, [])

  const updatePartQuantity = useCallback((id: string, quantity: number) => {
    setParts(prev => prev.map(part =>
      part.id === id ? { ...part, quantity: Math.max(1, quantity) } : part
    ))
  }, [])

  const updateLaborHours = useCallback((id: string, hours: number) => {
    setLaborItems(prev => prev.map(item =>
      item.id === id ? { ...item, hours: Math.max(0, hours) } : item
    ))
  }, [])

  const replacePart = useCallback((id: string, newPart: { name: string; partNo: string; price: number }) => {
    setParts(prev => prev.map(part =>
      part.id === id
        ? { ...part, name: newPart.name, partNo: newPart.partNo, price: newPart.price }
        : part
    ))
  }, [])

  const getSelectedParts = useCallback(() => parts.filter(part => part.selected), [parts])

  const getTotalPartsPrice = useCallback(() =>
    getSelectedParts().reduce((sum, part) => sum + part.price * part.quantity, 0),
    [getSelectedParts]
  )

  const getTotalLaborPrice = useCallback(() =>
    laborItems.reduce((sum, item) => sum + item.hourlyRate * item.hours, 0),
    [laborItems]
  )

  const getTotalPrice = useCallback(() => getTotalPartsPrice() + getTotalLaborPrice(),
    [getTotalPartsPrice, getTotalLaborPrice]
  )

  // Find part by name (fuzzy match)
  const findPartByName = useCallback((name: string): Part | undefined => {
    const normalizedName = name.toLowerCase().trim()
    // Exact match first
    let found = parts.find(p => p.name.toLowerCase() === normalizedName)
    if (found) return found
    // Category match
    found = parts.find(p => p.category.toLowerCase() === normalizedName)
    if (found) return found
    // Partial match
    found = parts.find(p =>
      p.name.toLowerCase().includes(normalizedName) ||
      p.category.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(p.name.toLowerCase()) ||
      normalizedName.includes(p.category.toLowerCase())
    )
    return found
  }, [parts])

  // Find labor by name (fuzzy match)
  const findLaborByName = useCallback((name: string): LaborItem | undefined => {
    const normalizedName = name.toLowerCase().trim()
    // Exact match first
    let found = laborItems.find(item => item.name.toLowerCase() === normalizedName)
    if (found) return found
    // Partial match
    found = laborItems.find(item =>
      item.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(item.name.toLowerCase())
    )
    return found
  }, [laborItems])

  // Register voice control handlers
  useEffect(() => {
    setWorkOrderHandlers({
      togglePartSelection: (partName: string, selected?: boolean): boolean => {
        const part = findPartByName(partName)
        if (!part) return false

        setParts(prev => prev.map(p => {
          if (p.id !== part.id) return p
          const newSelected = selected !== undefined ? selected : !p.selected
          return { ...p, selected: newSelected }
        }))
        return true
      },

      togglePartAction: (partName: string, action: '更换' | '钣金' | '喷漆', enabled?: boolean): boolean => {
        const part = findPartByName(partName)
        if (!part) return false

        setParts(prev => prev.map(p => {
          if (p.id !== part.id) return p
          const hasAction = p.selectedActions.includes(action)

          let newActions: typeof p.selectedActions
          if (enabled === undefined) {
            // Toggle
            newActions = hasAction
              ? p.selectedActions.filter(a => a !== action)
              : [...p.selectedActions, action]
          } else if (enabled && !hasAction) {
            newActions = [...p.selectedActions, action]
          } else if (!enabled && hasAction) {
            newActions = p.selectedActions.filter(a => a !== action)
          } else {
            newActions = p.selectedActions
          }

          return { ...p, selectedActions: newActions }
        }))
        return true
      },

      selectAllParts: (selected: boolean): void => {
        setParts(prev => prev.map(p => ({ ...p, selected })))
      },

      updatePartQuantity: (partName: string, quantity: number | string): boolean => {
        const part = findPartByName(partName)
        if (!part) return false

        let newQty: number
        const qtyStr = String(quantity)

        if (qtyStr.startsWith('+')) {
          newQty = part.quantity + parseInt(qtyStr.slice(1), 10)
        } else if (qtyStr.startsWith('-')) {
          newQty = part.quantity - parseInt(qtyStr.slice(1), 10)
        } else {
          newQty = parseInt(qtyStr, 10)
        }

        if (isNaN(newQty)) return false

        setParts(prev => prev.map(p =>
          p.id === part.id ? { ...p, quantity: Math.max(1, newQty) } : p
        ))
        return true
      },

      updateLaborHours: (laborName: string, hours: number | string): boolean => {
        const labor = findLaborByName(laborName)
        if (!labor) return false

        let newHours: number
        const hoursStr = String(hours)

        if (hoursStr.startsWith('+')) {
          newHours = labor.hours + parseFloat(hoursStr.slice(1))
        } else if (hoursStr.startsWith('-')) {
          newHours = labor.hours - parseFloat(hoursStr.slice(1))
        } else {
          newHours = parseFloat(hoursStr)
        }

        if (isNaN(newHours)) return false

        setLaborItems(prev => prev.map(item =>
          item.id === labor.id ? { ...item, hours: Math.max(0, newHours) } : item
        ))
        return true
      },

      addRepairItems: (items: string): void => {
        // For now, just log the items - in a real app this would parse and add parts
        console.log('Add repair items:', items)
        // The transcript is already being recorded by voice control context
      },

      openEpc: (partName: string): boolean => {
        const part = findPartByName(partName)
        if (!part) return false
        openEpcForPart(part.id)
        return true
      },

      // EPC part selection by callNo or description
      selectEpcPart: (callNo?: string, description?: string): { success: boolean; partName?: string } => {
        // If EPC is not open, can't select
        if (!epcOpen) {
          return { success: false }
        }

        let foundPart: EPCPart | undefined

        // Search by callNo first
        if (callNo) {
          const num = parseInt(callNo, 10)
          if (!isNaN(num)) {
            foundPart = epcParts.find(p => p.callNo === num)
          }
        }

        // If not found by callNo, search by description
        if (!foundPart && description) {
          const normalizedDesc = description.toLowerCase().trim()
          foundPart = epcParts.find(p =>
            p.description.toLowerCase().includes(normalizedDesc) ||
            normalizedDesc.includes(p.description.toLowerCase().substring(0, 10))
          )
        }

        if (foundPart) {
          setSelectedEpcPartId(foundPart.id)
          return { success: true, partName: foundPart.description }
        }

        return { success: false }
      },

      // Confirm EPC selection
      confirmEpcSelection: (): boolean => {
        if (!epcOpen || !selectedEpcPartId) {
          return false
        }
        confirmEpcSelection()
        return true
      },
    })
  }, [setWorkOrderHandlers, findPartByName, findLaborByName, openEpcForPart, epcOpen, selectedEpcPartId, confirmEpcSelection])

  return (
    <WorkOrderContext.Provider value={{
      parts,
      laborItems,
      setParts,
      setLaborItems,
      setExtractedParts,
      togglePartSelection,
      togglePartAction,
      updatePartQuantity,
      updateLaborHours,
      replacePart,
      getSelectedParts,
      getTotalPartsPrice,
      getTotalLaborPrice,
      getTotalPrice,
      findPartByName,
      findLaborByName,
      epcOpen,
      epcPartId,
      openEpcForPart,
      closeEpc,
      selectedEpcPartId,
      setSelectedEpcPartId,
      confirmEpcSelection,
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
