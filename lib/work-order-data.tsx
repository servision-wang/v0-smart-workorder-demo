// Demo data for work order app

export interface VehicleInfo {
  vin: string
  model: string
}

export interface VoiceInput {
  id: number
  text: string
}

export interface Part {
  id: string
  name: string
  partNo: string
  price: number
  quantity: number
  category: string
  actions: ('更换' | '钣金' | '喷漆')[]
  selectedActions: ('更换' | '钣金' | '喷漆')[]
  selected: boolean
}

export interface LaborItem {
  id: string
  name: string
  hourlyRate: number
  hours: number
}

export const demoVehicle: VehicleInfo = {
  vin: 'LS6J3E2X3SK414831',
  model: '一汽-大众 / Golf 1.4 2016'
}

export const demoVoiceInputs: VoiceInput[] = [
  { id: 1, text: '我需要更换前脸、电眼、前挡风玻璃、引擎盖。' },
  { id: 2, text: '更换左前大灯，左前翼子板钣金喷漆。' },
  { id: 3, text: '更换水箱。' }
]

export const demoParts: Part[] = [
  {
    id: '1',
    name: '进气格栅',
    partNo: '5GG 807 217 AB',
    price: 320.00,
    quantity: 1,
    category: '前脸',
    actions: ['更换', '钣金', '喷漆'],
    selectedActions: ['更换'],
    selected: true
  },
  {
    id: '2',
    name: '进气格栅雷达',
    partNo: '5GG 807 357',
    price: 65.00,
    quantity: 3,
    category: '电眼',
    actions: ['更换', '钣金', '喷漆'],
    selectedActions: ['更换'],
    selected: true
  },
  {
    id: '3',
    name: '前挡风玻璃',
    partNo: '5GG 819 042',
    price: 2100.00,
    quantity: 1,
    category: '前挡风玻璃',
    actions: ['更换', '钣金', '喷漆'],
    selectedActions: ['更换'],
    selected: true
  },
  {
    id: '4',
    name: '前舱盖',
    partNo: '5GG 607 033',
    price: 1400.00,
    quantity: 1,
    category: '引擎盖',
    actions: ['更换', '钣金', '喷漆'],
    selectedActions: ['更换'],
    selected: true
  },
  {
    id: '5',
    name: '大灯，用于气体放电灯泡(左)',
    partNo: '5GG 941031',
    price: 800.00,
    quantity: 1,
    category: '左前大灯',
    actions: ['更换', '钣金', '喷漆'],
    selectedActions: ['更换'],
    selected: true
  },
  {
    id: '6',
    name: '左前翼子板',
    partNo: '5GG 819 042',
    price: 650.00,
    quantity: 1,
    category: '左前翼子板',
    actions: ['更换', '钣金', '喷漆'],
    selectedActions: ['钣金', '喷漆'],
    selected: true
  },
  {
    id: '7',
    name: '散热器',
    partNo: '5Q0 121 251 EM',
    price: 800.00,
    quantity: 1,
    category: '水箱',
    actions: ['更换', '钣金', '喷漆'],
    selectedActions: ['更换'],
    selected: true
  }
]

export const demoLaborItems: LaborItem[] = [
  { id: 'l1', name: '进气格栅', hourlyRate: 100, hours: 1 },
  { id: 'l2', name: '进气格栅雷达', hourlyRate: 100, hours: 0.3 },
  { id: 'l3', name: '前舱盖', hourlyRate: 100, hours: 1 },
  { id: 'l4', name: '前挡风玻璃', hourlyRate: 100, hours: 2 },
  { id: 'l5', name: '左前大灯', hourlyRate: 100, hours: 0.5 },
  { id: 'l6', name: '左前翼子板钣金', hourlyRate: 100, hours: 3 },
  { id: 'l7', name: '左前翼子板喷漆', hourlyRate: 100, hours: 2 },
  { id: 'l8', name: '散热器', hourlyRate: 100, hours: 1.5 }
]

export const highlightedDescription = `我需要<span class="highlight font-semibold">更换</span><span class="highlight">前脸</span>、<span class="highlight">电眼</span>、<span class="highlight">前挡风玻璃</span>、<span class="highlight">引擎盖</span>。<span class="highlight font-semibold">更换</span><span class="highlight">左前大灯</span>，<span class="highlight underline">左前翼子板</span><span class="highlight bg-primary/20 px-1.5 py-0.5 rounded">钣金</span><span class="bg-primary text-primary-foreground px-1.5 py-0.5 rounded">喷漆</span>。<span class="highlight font-semibold">更换</span><span class="highlight">水箱</span>。`
