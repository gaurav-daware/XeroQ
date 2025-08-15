"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, FileText, Printer, ArrowLeft, Image } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function StudentUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [printOptions, setPrintOptions] = useState({
    colorMode: "bw",
    copies: "1",
    duplex: "no",
    paperSize: "a4", // New option for images
    imageSize: "fit", // New option for images
  })
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isImageFile = file && file.type.startsWith('image/')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type - now includes images
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/gif",
        "image/bmp",
        "image/tiff",
        "image/webp"
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, DOCX, or image files (JPG, PNG, GIF, BMP, TIFF, WebP).",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 15MB for images, 10MB for documents)
      const maxSize = selectedFile.type.startsWith('image/') ? 15 * 1024 * 1024 : 50 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        const maxSizeMB = selectedFile.type.startsWith('image/') ? '15MB' : '50MB'
        toast({
          title: "File too large",
          description: `Please upload files smaller than ${maxSizeMB}.`,
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("printOptions", JSON.stringify(printOptions))

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      // Redirect to success page with OTP
      router.push(`/student/success?otp=${result.otp}`)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
    
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-purple-600 mr-2" />
    }
    return <FileText className="h-8 w-8 text-blue-600 mr-2" />
  }

  const getFileTypeText = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return fileType.split('/')[1].toUpperCase() + ' Image'
    }
    if (fileType === 'application/pdf') return 'PDF Document'
    if (fileType.includes('wordprocessingml')) return 'Word Document'
    return 'Document'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <a href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </a>
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Printer className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">XeroQ</h1>
          </div>
          <p className="text-lg text-gray-600">Student Portal</p>
          <p className="text-sm text-gray-500 mt-2">Upload your document or image and skip the queue!</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload File
            </CardTitle>
            <CardDescription>Upload your PDF, DOCX, or image file and set your print preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Document or Image File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Input id="file" type="file" accept=".pdf,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp" onChange={handleFileChange} className="hidden" />
                  <Label htmlFor="file" className="cursor-pointer">
                    {file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          {getFileIcon()}
                          <div className="text-left">
                            <span className="text-sm font-medium block">{file.name}</span>
                            <span className="text-xs text-gray-500">{getFileTypeText(file.type)} • {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload PDF, DOCX, or Images</p>
                        <p className="text-xs text-gray-400 mt-1">Documents: Max 50MB | Images: Max 15MB</p>
                        <p className="text-xs text-gray-400">Supported: PDF, DOCX, JPG, PNG, GIF, BMP, TIFF, WebP</p>
                      </div>
                    )}
                  </Label>
                </div>
              </div>

              {/* Print Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Print Preferences</h3>

                {/* Color Mode */}
                <div className="space-y-3">
                  <Label>Color Mode</Label>
                  <RadioGroup
                    value={printOptions.colorMode}
                    onValueChange={(value) => setPrintOptions((prev) => ({ ...prev, colorMode: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bw" id="bw" />
                      <Label htmlFor="bw">Black & White</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="color" id="color" />
                      <Label htmlFor="color">Color {isImageFile && "(Recommended for images)"}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Number of Copies */}
                <div className="space-y-2">
                  <Label htmlFor="copies">Number of Copies</Label>
                  <Select
                    value={printOptions.copies}
                    onValueChange={(value) => setPrintOptions((prev) => ({ ...prev, copies: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "copy" : "copies"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Paper Size - Show for images */}
                {isImageFile && (
                  <div className="space-y-2">
                    <Label htmlFor="paperSize">Paper Size</Label>
                    <Select
                      value={printOptions.paperSize}
                      onValueChange={(value) => setPrintOptions((prev) => ({ ...prev, paperSize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                        <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                        <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
                        <SelectItem value="4x6">4×6 Photo</SelectItem>
                        <SelectItem value="5x7">5×7 Photo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Image Size - Show for images */}
                {isImageFile && (
                  <div className="space-y-3">
                    <Label>Image Sizing</Label>
                    <RadioGroup
                      value={printOptions.imageSize}
                      onValueChange={(value) => setPrintOptions((prev) => ({ ...prev, imageSize: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fit" id="fit" />
                        <Label htmlFor="fit">Fit to page (maintain aspect ratio)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fill" id="fill" />
                        <Label htmlFor="fill">Fill page (may crop image)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="actual" id="actual" />
                        <Label htmlFor="actual">Actual size (may be cut off)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Duplex - Hide for images */}
                {!isImageFile && (
                  <div className="space-y-3">
                    <Label>Double-sided Printing (Duplex)</Label>
                    <RadioGroup
                      value={printOptions.duplex}
                      onValueChange={(value) => setPrintOptions((prev) => ({ ...prev, duplex: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no-duplex" />
                        <Label htmlFor="no-duplex">Single-sided</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes-duplex" />
                        <Label htmlFor="yes-duplex">Double-sided</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={!file || isUploading} size="lg">
                {isUploading ? "Uploading..." : "Submit & Get OTP"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
