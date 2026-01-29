// Demo data for work order app

export interface VehicleInfo {
  vin: string
  brand: string
  modelDesignation: string
  productionDate: string
  color: string
  upholstery: string
  marketSpecification: string
  series: string
  body: string
  steering: string
  doors: number
  engineCode: string
  displacement: string
  power: number
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
  actions: ('Replace' | 'Body Repair' | 'Paint')[]
  selectedActions: ('Replace' | 'Body Repair' | 'Paint')[]
  selected: boolean
}

export interface LaborItem {
  id: string
  name: string
  hourlyRate: number
  hours: number
}

// Demo BMW vehicle data based on provided UI
export const demoVehicle: VehicleInfo = {
  vin: 'LBV8A1403KMM22983',
  brand: 'BMW',
  modelDesignation: "3' F30 LCI",
  productionDate: '13.11.2018',
  color: 'ALPINWEISS III (300)',
  upholstery: 'LEDER DAKOTA/Schwarz Kontr.Blau (LCNL)',
  marketSpecification: '320i',
  series: '3 F30 MUE',
  body: 'Saloon',
  steering: 'L',
  doors: 4,
  engineCode: 'B48B20M0',
  displacement: '2.00',
  power: 135
}

export const demoVoiceInputs: VoiceInput[] = [
  { id: 1, text: 'I need to replace the front grille, radar sensor, windshield, and hood.' },
  { id: 2, text: 'Replace the left front headlight, body repair and paint the left front fender.' },
  { id: 3, text: 'Replace the radiator.' }
]

export const demoParts: Part[] = [
  {
    id: '1',
    name: 'Front Grille Assembly',
    partNo: '5GG 807 217 AB',
    price: 320.00,
    quantity: 1,
    category: 'Front Grille',
    actions: ['Replace', 'Body Repair', 'Paint'],
    selectedActions: ['Replace'],
    selected: true
  },
  {
    id: '2',
    name: 'Front Radar Sensor',
    partNo: '5GG 807 357',
    price: 65.00,
    quantity: 3,
    category: 'Radar Sensor',
    actions: ['Replace', 'Body Repair', 'Paint'],
    selectedActions: ['Replace'],
    selected: true
  },
  {
    id: '3',
    name: 'Front Windshield',
    partNo: '5GG 819 042',
    price: 2100.00,
    quantity: 1,
    category: 'Windshield',
    actions: ['Replace', 'Body Repair', 'Paint'],
    selectedActions: ['Replace'],
    selected: true
  },
  {
    id: '4',
    name: 'Hood Assembly',
    partNo: '5GG 607 033',
    price: 1400.00,
    quantity: 1,
    category: 'Hood',
    actions: ['Replace', 'Body Repair', 'Paint'],
    selectedActions: ['Replace'],
    selected: true
  },
  {
    id: '5',
    name: 'Headlight Assembly, Xenon (Left)',
    partNo: '5GG 941031',
    price: 800.00,
    quantity: 1,
    category: 'Left Headlight',
    actions: ['Replace', 'Body Repair', 'Paint'],
    selectedActions: ['Replace'],
    selected: true
  },
  {
    id: '6',
    name: 'Left Front Fender',
    partNo: '5GG 819 042',
    price: 650.00,
    quantity: 1,
    category: 'Left Fender',
    actions: ['Replace', 'Body Repair', 'Paint'],
    selectedActions: ['Body Repair', 'Paint'],
    selected: true
  },
  {
    id: '7',
    name: 'Radiator Assembly',
    partNo: '5Q0 121 251 EM',
    price: 800.00,
    quantity: 1,
    category: 'Radiator',
    actions: ['Replace', 'Body Repair', 'Paint'],
    selectedActions: ['Replace'],
    selected: true
  }
]

export const demoLaborItems: LaborItem[] = [
  { id: 'l1', name: 'Front Grille Replacement', hourlyRate: 100, hours: 1 },
  { id: 'l2', name: 'Radar Sensor Installation', hourlyRate: 100, hours: 0.3 },
  { id: 'l3', name: 'Hood Replacement', hourlyRate: 100, hours: 1 },
  { id: 'l4', name: 'Windshield Replacement', hourlyRate: 100, hours: 2 },
  { id: 'l5', name: 'Left Headlight Replacement', hourlyRate: 100, hours: 0.5 },
  { id: 'l6', name: 'Left Fender Body Repair', hourlyRate: 100, hours: 3 },
  { id: 'l7', name: 'Left Fender Paint', hourlyRate: 100, hours: 2 },
  { id: 'l8', name: 'Radiator Replacement', hourlyRate: 100, hours: 1.5 }
]

export const highlightedDescription = `I need to <span class="highlight font-semibold">replace</span> the <span class="highlight">front grille</span>, <span class="highlight">radar sensor</span>, <span class="highlight">windshield</span>, and <span class="highlight">hood</span>. <span class="highlight font-semibold">Replace</span> the <span class="highlight">left headlight</span>, <span class="highlight underline">left front fender</span> <span class="highlight bg-primary/20 px-1.5 py-0.5 rounded">body repair</span> and <span class="bg-primary text-primary-foreground px-1.5 py-0.5 rounded">paint</span>. <span class="highlight font-semibold">Replace</span> the <span class="highlight">radiator</span>.`

// Vehicle brand/series/model data for cascading dropdowns
export interface VehicleBrand {
  id: string
  name: string
  series: VehicleSeries[]
}

export interface VehicleSeries {
  id: string
  name: string
  models: VehicleModel[]
}

export interface VehicleModel {
  id: string
  name: string
}

export const vehicleBrands: VehicleBrand[] = [
  {
    id: 'bmw',
    name: 'BMW',
    series: [
      {
        id: 'bmw-3',
        name: '3 Series',
        models: [
          { id: 'bmw-3-320i', name: '320i' },
          { id: 'bmw-3-325i', name: '325i' },
          { id: 'bmw-3-330i', name: '330i' },
          { id: 'bmw-3-m340i', name: 'M340i' },
        ]
      },
      {
        id: 'bmw-5',
        name: '5 Series',
        models: [
          { id: 'bmw-5-520i', name: '520i' },
          { id: 'bmw-5-530i', name: '530i' },
          { id: 'bmw-5-540i', name: '540i' },
          { id: 'bmw-5-m550i', name: 'M550i' },
        ]
      },
      {
        id: 'bmw-x3',
        name: 'X3',
        models: [
          { id: 'bmw-x3-sdrive', name: 'sDrive30i' },
          { id: 'bmw-x3-xdrive', name: 'xDrive30i' },
          { id: 'bmw-x3-m40i', name: 'M40i' },
        ]
      },
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    series: [
      {
        id: 'mb-c',
        name: 'C-Class',
        models: [
          { id: 'mb-c-c200', name: 'C200' },
          { id: 'mb-c-c300', name: 'C300' },
          { id: 'mb-c-amg43', name: 'AMG C43' },
        ]
      },
      {
        id: 'mb-e',
        name: 'E-Class',
        models: [
          { id: 'mb-e-e300', name: 'E300' },
          { id: 'mb-e-e450', name: 'E450' },
          { id: 'mb-e-amg53', name: 'AMG E53' },
        ]
      },
    ]
  },
  {
    id: 'audi',
    name: 'Audi',
    series: [
      {
        id: 'audi-a4',
        name: 'A4',
        models: [
          { id: 'audi-a4-35', name: '35 TFSI' },
          { id: 'audi-a4-40', name: '40 TFSI' },
          { id: 'audi-a4-45', name: '45 TFSI' },
        ]
      },
      {
        id: 'audi-a6',
        name: 'A6',
        models: [
          { id: 'audi-a6-40', name: '40 TFSI' },
          { id: 'audi-a6-45', name: '45 TFSI' },
          { id: 'audi-a6-55', name: '55 TFSI' },
        ]
      },
    ]
  },
  {
    id: 'porsche',
    name: 'Porsche',
    series: [
      {
        id: 'porsche-911',
        name: '911',
        models: [
          { id: 'porsche-911-carrera', name: 'Carrera' },
          { id: 'porsche-911-turbo', name: 'Turbo' },
          { id: 'porsche-911-gt3', name: 'GT3' },
        ]
      },
      {
        id: 'porsche-cayenne',
        name: 'Cayenne',
        models: [
          { id: 'porsche-cayenne-base', name: 'Cayenne' },
          { id: 'porsche-cayenne-s', name: 'Cayenne S' },
          { id: 'porsche-cayenne-turbo', name: 'Cayenne Turbo' },
        ]
      },
    ]
  },
]
