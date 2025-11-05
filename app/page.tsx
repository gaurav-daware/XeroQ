import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Upload, Shield, Users, Clock, FileText } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="text-center pt-16 pb-8">
        <div className="flex items-center justify-center mb-6">
          <Printer className="h-16 w-16 text-blue-600 mr-4" />
          <h1 className="text-6xl font-bold text-gray-900">XeroQ</h1>
        </div>
        <p className="text-2xl text-gray-600 mb-4">Upload online, skip the queue, collect your prints instantly</p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto px-4">
          Skip the queue, upload your documents online, and get them printed hassle-free at your college xerox center.
        </p>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6">
            <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
            <p className="text-gray-600 text-sm">Upload PDF or DOCX files with your print preferences</p>
          </div>
          <div className="text-center p-6">
            <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Skip the Queue</h3>
            <p className="text-gray-600 text-sm">No more waiting in long lines at the xerox center</p>
          </div>
          <div className="text-center p-6">
            <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure & Fast</h3>
            <p className="text-gray-600 text-sm">OTP-based secure access with 1-hour auto-expiry</p>
          </div>
        </div>
      </div>

      {/* Main Options */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Choose Your Access</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Option */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-blue-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Users className="h-16 w-16 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-700">I'm a Student</CardTitle>
              <CardDescription className="text-base">Upload your documents and get an OTP for printing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Upload PDF, DOCX, or image files</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Choose print preferences (Color, Copies, Paper Size)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Get unique OTP for xerox staff</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Skip the queue at xerox center</span>
                </div>
              </div>

              <Button asChild className="w-full" size="lg">
                <a href="/student">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Document
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Option */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-green-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Shield className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">I'm Xerox Staff</CardTitle>
              <CardDescription className="text-base">Access admin panel to retrieve student documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  <span>Enter student OTP to retrieve documents</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  <span>View print preferences and settings</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  <span>Download documents for printing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  <span>Mark jobs as completed</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full bg-green-50 border-green-200 hover:bg-green-100"
                size="lg"
              >
                <a href="/admin">
                  <Shield className="h-5 w-5 mr-2" />
                  Access Admin Panel
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">
            <strong>XeroQ</strong> - Making college printing smarter and faster
          </p>
          <p className="text-sm text-gray-500">Secure • Fast • Reliable • No Registration Required</p>
        </div>
      </div>
    </div>
  )
}
