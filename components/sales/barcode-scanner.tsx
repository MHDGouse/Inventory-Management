"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Camera, ScanLine, X, Zap } from "lucide-react"
import type { Product } from "@/lib/types"
import { getProductByBarcode } from "@/lib/database"

interface BarcodeScannerProps {
  onProductFound: (product: Product) => void
  onError: (message: string) => void
}

export function BarcodeScanner({ onProductFound, onError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [scanResult, setScanResult] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function
  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
  }

  // Start camera scanning
  const startCameraScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)

        // Start scanning for barcodes
        scanIntervalRef.current = setInterval(() => {
          scanForBarcode()
        }, 500)
      }
    } catch (error) {
      console.error("Camera access denied:", error)
      onError("Camera access denied. Please allow camera permissions or enter barcode manually.")
    }
  }

  // Simple barcode detection (mock implementation)
  // In a real app, you would use a library like @zxing/library
  const scanForBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context || video.videoWidth === 0) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Mock barcode detection - in reality, you'd use a proper barcode library
    // For demo purposes, we'll simulate finding a barcode after a few seconds
    const mockBarcodes = ["1234567890123", "2234567890123", "3234567890123", "4234567890123"]
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]

    // Simulate barcode detection with 10% chance per scan
    if (Math.random() < 0.1) {
      setScanResult(randomBarcode)
      handleBarcodeDetected(randomBarcode)
    }
  }

  // Handle barcode detection
  const handleBarcodeDetected = async (barcode: string) => {
    stopScanning()
    setIsDialogOpen(false)

    try {
      const product = await getProductByBarcode(barcode)
      if (product) {
        onProductFound(product)
      } else {
        onError(`Product not found for barcode: ${barcode}`)
      }
    } catch (error) {
      console.error("Barcode lookup failed:", error)
      onError("Failed to lookup product")
    }
  }

  // Handle manual barcode input
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    try {
      const product = await getProductByBarcode(barcodeInput.trim())
      if (product) {
        onProductFound(product)
        setBarcodeInput("")
        setIsDialogOpen(false)
      } else {
        onError(`Product not found for barcode: ${barcodeInput}`)
      }
    } catch (error) {
      console.error("Barcode lookup failed:", error)
      onError("Failed to lookup product")
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      stopScanning()
      setBarcodeInput("")
      setScanResult("")
    }
  }, [isDialogOpen])

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 xs:h-10 xs:px-4"
          size="sm"
        >
          <ScanLine className="h-4 w-4" />
          <span className="hidden xs:inline">Scan Barcode</span>
          <span className="xs:hidden">Scan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Barcode Scanner</DialogTitle>
          <DialogDescription>Scan a product barcode or enter it manually to add to cart.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Scanner */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Camera Scanner</h4>
                  {isScanning && (
                    <Button variant="outline" size="sm" onClick={stopScanning} className="gap-1 bg-transparent h-8">
                      <X className="h-3 w-3" />
                      Stop
                    </Button>
                  )}
                </div>

                {!isScanning ? (
                  <div className="text-center py-6 sm:py-8">
                    <Camera className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Use your device camera to scan product barcodes
                    </p>
                    <Button onClick={startCameraScanning} className="gap-2">
                      <Camera className="h-4 w-4" />
                      Start Camera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Scanning overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-primary w-40 sm:w-48 h-28 sm:h-32 rounded-lg relative">
                          <div className="absolute inset-0 border-2 border-primary animate-pulse rounded-lg" />
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary animate-pulse" />
                        </div>
                      </div>

                      {/* Scanning indicator */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
                        <Zap className="h-3 w-3 animate-pulse" />
                        <span className="text-xs">Scanning...</span>
                      </div>
                    </div>

                    {scanResult && (
                      <div className="text-center text-sm text-muted-foreground">Detected: {scanResult}</div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-medium">Manual Entry</h4>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <ScanLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter barcode number"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="pl-10 h-9 sm:h-10"
                      type="number"
                    />
                  </div>
                  <Button type="submit" disabled={!barcodeInput.trim()} className="h-9 sm:h-10">
                    Add
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
