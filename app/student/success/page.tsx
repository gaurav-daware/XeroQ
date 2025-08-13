"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Printer, Clock, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const otp = searchParams.get("otp")
  const { toast } = useToast()

  const copyOTP = () => {
    if (otp) {
      navigator.clipboard.writeText(otp)
      toast({
        title: "OTP Copied!",
        description: "The OTP has been copied to your clipboard.",
      })
    }
  }

  if (!otp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Invalid access. Please upload a document first.</p>
            <Button asChild className="mt-4">
              <a href="/student">Upload Document</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Upload Successful!</CardTitle>
            <CardDescription>
              Your document has been uploaded successfully. Show this OTP to the xerox staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OTP Display */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Your OTP Code</p>
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6">
                <p className="text-4xl font-bold font-mono tracking-wider text-center text-blue-600">{otp}</p>
              </div>
              <Button onClick={copyOTP} variant="outline" size="sm" className="mt-3 bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                Copy OTP
              </Button>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Printer className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Visit the Xerox Center</p>
                  <p className="text-sm text-gray-600">
                    Go to your college xerox center and provide this OTP to the staff.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Valid for 1 Hour</p>
                  <p className="text-sm text-gray-600">This OTP will expire after 1 hour for security.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <a href="/student">Upload Another Document</a>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <a href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
