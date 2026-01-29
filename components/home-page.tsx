'use client'

import { useState, useCallback, useRef } from 'react'
import { Search, ScanLine, ChevronDown, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { vehicleBrands, demoVehicle, type VehicleBrand, type VehicleSeries } from '@/lib/work-order-data'

interface HomePageProps {
  onVinSearch: (vin: string) => void
  onManualSelect: (brand: string, series: string, model: string) => void
}

export function HomePage({ onVinSearch, onManualSelect }: HomePageProps) {
  const [vinInput, setVinInput] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Cascading dropdown state
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<VehicleSeries | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  
  // Dropdown open state
  const [brandOpen, setBrandOpen] = useState(false)
  const [seriesOpen, setSeriesOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)

  const handleVinSearch = useCallback(() => {
    if (vinInput.trim().length >= 17) {
      onVinSearch(vinInput.trim().toUpperCase())
    }
  }, [vinInput, onVinSearch])

  const handleVinKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVinSearch()
    }
  }, [handleVinSearch])

  // Open file picker when scan button is clicked
  const handleScanClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle image selection and mock OCR
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Show selected image preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Start mock OCR scanning
      setIsScanning(true)
      setTimeout(() => {
        // Mock OCR result - return demo BMW VIN
        setVinInput(demoVehicle.vin)
        setIsScanning(false)
        // Auto-search after scan
        onVinSearch(demoVehicle.vin)
        // Reset selected image after navigation
        setSelectedImage(null)
      }, 2000)
    }
    // Reset file input so same file can be selected again
    e.target.value = ''
  }, [onVinSearch])

  const handleBrandSelect = useCallback((brand: VehicleBrand) => {
    setSelectedBrand(brand)
    setSelectedSeries(null)
    setSelectedModel(null)
    setBrandOpen(false)
  }, [])

  const handleSeriesSelect = useCallback((series: VehicleSeries) => {
    setSelectedSeries(series)
    setSelectedModel(null)
    setSeriesOpen(false)
  }, [])

  const handleModelSelect = useCallback((model: string) => {
    setSelectedModel(model)
    setModelOpen(false)
  }, [])

  const handleManualQuery = useCallback(() => {
    if (selectedBrand && selectedSeries && selectedModel) {
      onManualSelect(selectedBrand.name, selectedSeries.name, selectedModel)
    }
  }, [selectedBrand, selectedSeries, selectedModel, onManualSelect])

  const canQuery = selectedBrand && selectedSeries && selectedModel

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-center px-4 py-4 border-b border-border bg-card">
        <h1 className="font-semibold text-foreground tracking-tight">Verify Model</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        {/* VIN Query Section */}
        <div className="mb-8">
          <p className="text-sm font-medium text-primary mb-3">VIN Query</p>
          <div className="flex gap-2">
            {/* VIN Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Please input VIN"
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                onKeyDown={handleVinKeyDown}
                maxLength={17}
                className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono"
              />
            </div>
            
            {/* Scan Button */}
            <button
              onClick={handleScanClick}
              disabled={isScanning}
              className="w-14 h-14 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
              title="Scan VIN from image"
            >
              {isScanning ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <ScanLine className="w-6 h-6" />
              )}
            </button>
            
            {/* Hidden file input for image selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          
          {/* Image preview when scanning */}
          {selectedImage && (
            <div className="mt-3 relative">
              <div className="rounded-xl overflow-hidden border border-border">
                <img 
                  src={selectedImage} 
                  alt="Selected VIN image" 
                  className="w-full h-32 object-cover"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-foreground">Recognizing VIN...</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Scan hint */}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Tap scan icon to select image for VIN recognition (OCR)
          </p>
        </div>

        {/* Manual Select Section */}
        <div>
          <p className="text-sm font-medium text-primary mb-3">Manually select</p>
          
          {/* Brand Dropdown */}
          <div className="relative mb-3">
            <button
              onClick={() => {
                setBrandOpen(!brandOpen)
                setSeriesOpen(false)
                setModelOpen(false)
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-card border border-border rounded-xl text-sm text-left transition-all hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <span className={selectedBrand ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedBrand ? selectedBrand.name : 'Please choose brand'}
              </span>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${brandOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {brandOpen && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {vehicleBrands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand)}
                    className="w-full px-4 py-3 text-sm text-left text-foreground hover:bg-primary/10 transition-colors"
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Series Dropdown */}
          <div className="relative mb-3">
            <button
              onClick={() => {
                if (selectedBrand) {
                  setSeriesOpen(!seriesOpen)
                  setBrandOpen(false)
                  setModelOpen(false)
                }
              }}
              disabled={!selectedBrand}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-card border border-border rounded-xl text-sm text-left transition-all hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={selectedSeries ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedSeries ? selectedSeries.name : 'Please choose series'}
              </span>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${seriesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {seriesOpen && selectedBrand && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {selectedBrand.series.map((series) => (
                  <button
                    key={series.id}
                    onClick={() => handleSeriesSelect(series)}
                    className="w-full px-4 py-3 text-sm text-left text-foreground hover:bg-primary/10 transition-colors"
                  >
                    {series.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model Dropdown */}
          <div className="relative mb-6">
            <button
              onClick={() => {
                if (selectedSeries) {
                  setModelOpen(!modelOpen)
                  setBrandOpen(false)
                  setSeriesOpen(false)
                }
              }}
              disabled={!selectedSeries}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-card border border-border rounded-xl text-sm text-left transition-all hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={selectedModel ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedModel ? selectedModel : 'Please choose model'}
              </span>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {modelOpen && selectedSeries && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {selectedSeries.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.name)}
                    className="w-full px-4 py-3 text-sm text-left text-foreground hover:bg-primary/10 transition-colors"
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Query Button */}
          <Button
            onClick={handleManualQuery}
            disabled={!canQuery}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
          >
            Query
          </Button>
        </div>
      </div>
    </div>
  )
}
