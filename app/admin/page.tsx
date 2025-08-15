"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Search, Download, FileText, Printer, CheckCircle, ArrowLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface PrintJob {
  otp: string
  filename: string
  uploadTime: string
  printOptions: {
    colorMode: string
    copies: string
    duplex?: string
    paperSize?: string
    imageSize?: string
  }
  fileUrl: string
  status: "pending" | "completed"
}

export default function AdminPage() {
  const [otp, setOtp] = useState("")
  const [printJob, setPrintJob] = useState<PrintJob | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null) // NEW state for frontend error display
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      setSearchError("Please enter the OTP provided by the student.")
      toast({
        title: "Enter OTP",
        description: "Please enter the OTP provided by the student.",
        variant: "destructive",
      })
      return
    }

    setSearchError(null) // clear previous errors
    setIsSearching(true)

    try {
      const response = await fetch(`/api/admin/lookup?otp=${otp.toUpperCase()}`)

      if (!response.ok) {
        if (response.status === 404) {
          setSearchError("Invalid OTP or document not found.") // set visible error
          toast({
            title: "OTP not found",
            description: "Invalid OTP, expired document, or no document found with this code.",
            variant: "destructive",
          })
        } else {
          setSearchError("Unable to search for the document. Please try again.")
          toast({
            title: "Search failed",
            description: "Unable to search for the document. Please try again.",
            variant: "destructive",
          })
        }
        setPrintJob(null)
        return
      }

      const job = await response.json()
      setPrintJob(job)
      setSearchError(null) // clear error if successful
    } catch (error) {
      setSearchError("Please try again later.")
      toast({
        title: "Lookup failed",
        description: "Please try again later.",
        variant: "destructive",
      })
      setPrintJob(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDownload = async () => {
    if (!printJob) return

    try {
      const response = await fetch(printJob.fileUrl)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = printJob.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download started",
        description: "The document is being downloaded.",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMarkCompleted = async () => {
    if (!printJob) return

    try {
      const response = await fetch("/api/admin/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: printJob.otp }),
      })

      if (response.ok) {
        setPrintJob((prev) => (prev ? { ...prev, status: "completed" } : null))
        toast({
          title: "Job completed",
          description: "Print job marked as completed.",
        })
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not mark job as completed.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8"> {/* Added responsive padding */}
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" size="sm" className="mr-4">
          <a href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </a>
        </Button>
      </div>
      <div className="max-w-4xl mx-auto pt-8 px-2 sm:px-0"> {/* Ensure full width on small screens, add horizontal padding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">XeroQ Admin</h1>
          </div>
          <p className="text-lg text-gray-600">Xerox Staff Panel</p>
          <p className="text-sm text-gray-500 mt-2">Enter student OTP to retrieve documents</p>
        </div>

        <div className="grid gap-6">
          {/* OTP Lookup */}
          <Card className="shadow-lg mx-auto w-full"> {/* Ensure card takes full width */}
            <CardHeader>
              <CardTitle className="flex items-center text-xl sm:text-2xl"> {/* Responsive font size */}
                <Search className="h-5 w-5 mr-2" />
                OTP Lookup
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Enter the OTP provided by the student to retrieve their document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4"> {/* Responsive flex */}
                <div className="flex-1">
                  <Label htmlFor="otp" className="sr-only">
                    OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP (e.g., A1B2C3)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-lg font-mono tracking-wider w-full" // Ensure input takes full width on small screens
                  />
                </div>
                <Button type="submit" disabled={isSearching} size="lg" className="w-full sm:w-auto"> {/* Ensure button takes full width on small screens */}
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </form>
              {/* Show frontend error message */}
              {searchError && (
                <p className="mt-2 text-sm text-red-600 font-bold text-center">{searchError}</p>
              )}
            </CardContent>
          </Card>

          {/* Print Job Details */}
          {printJob && (
            <Card className="shadow-lg mx-auto w-full"> {/* Ensure card takes full width */}
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xl sm:text-2xl"> {/* Responsive flex for title and badge */}
                  <div className="flex items-center mb-2 sm:mb-0">
                    <FileText className="h-5 w-5 mr-2" />
                    Document Found
                  </div>
                  <Badge variant={printJob.status === "completed" ? "default" : "secondary"}>
                    {printJob.status === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  OTP: <span className="font-mono font-bold">{printJob.otp}</span> • Uploaded:{" "}
                  {new Date(printJob.uploadTime).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Info */}
                <div>
                  <h3 className="font-semibold mb-2 text-base sm:text-lg">Document</h3> {/* Responsive font size */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <span className="font-medium text-sm sm:text-base break-words">{printJob.filename}</span> {/* Added break-words for long filenames */}
                  </div>
                </div>

                <Separator />

                {/* Print Preferences */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-base sm:text-lg"> {/* Responsive font size */}
                    <Printer className="h-4 w-4 mr-2" />
                    Print Preferences
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Changed md to sm for more aggressive stacking */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Color Mode</p>
                      <p className="font-semibold text-base">
                        {printJob.printOptions.colorMode === "color" ? "Color" : "Black & White"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Copies</p>
                      <p className="font-semibold text-base">{printJob.printOptions.copies}</p>
                    </div>
                    {printJob.printOptions.duplex && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Duplex</p>
                        <p className="font-semibold text-base">
                          {printJob.printOptions.duplex === "yes" ? "Double-sided" : "Single-sided"}
                        </p>
                      </div>
                    )}
                    {printJob.printOptions.paperSize && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Paper Size</p>
                        <p className="font-semibold text-base">{printJob.printOptions.paperSize.toUpperCase()}</p>
                      </div>
                    )}
                    {printJob.printOptions.imageSize && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Image Sizing</p>
                        <p className="font-semibold text-base">
                          {printJob.printOptions.imageSize === "fit"
                            ? "Fit to page"
                            : printJob.printOptions.imageSize === "fill"
                            ? "Fill page"
                            : "Actual size"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3"> {/* Changed to flex-col on mobile, flex-row on sm screens */}
                  <Button onClick={handleDownload} className="w-full sm:flex-1" size="lg"> {/* Full width on mobile, then flex-1 */}
                    <Download className="h-4 w-4 mr-2" />
                    Download Document
                  </Button>
                  {printJob.status === "pending" && (
                    <Button onClick={handleMarkCompleted} variant="outline" size="lg" className="w-full sm:flex-1 bg-transparent"> {/* Full width on mobile, then flex-1 */}
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Printed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Student portal:{" "}
            <a href="/" className="text-green-600 hover:underline">
              Upload Documents
            </a>
          </p>
        </div>
      </div>
      <div className="text-center mt-8">
        <p className="text-xs text-gray-400">XeroQ Admin Panel • Access restricted to authorized staff only</p>
      </div>
    </div>
  )
}
