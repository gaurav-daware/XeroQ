import { type NextRequest, NextResponse } from "next/server"
import printJobStorage from "@/lib/storage"

function generateOTP(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let otp = ""
  for (let i = 0; i < 6; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return otp
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD REQUEST START ===')
    
    const formData = await request.formData()
    const file = formData.get("file") as File
    const printOptionsStr = formData.get("printOptions") as string

    console.log('File details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    })

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

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
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload PDF, DOCX, or image files." }, { status: 400 })
    }

    // Validate file size (15MB for images, 10MB for documents)
    const maxSize = file.type.startsWith('image/') ? 15 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const maxSizeMB = file.type.startsWith('image/') ? '15MB' : '10MB'
      return NextResponse.json({ error: `File too large. Maximum size is ${maxSizeMB}.` }, { status: 400 })
    }

    const printOptions = JSON.parse(printOptionsStr)
    const otp = generateOTP()

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${otp}_${timestamp}.${fileExtension}`

    console.log('Attempting to upload file:', uniqueFilename)

    // Upload file to Supabase Storage
    try {
      const filePath = await printJobStorage.uploadFile(file, uniqueFilename)
      console.log('File uploaded successfully to:', filePath)
      
      // Store print job in Supabase Database
      const printJob = {
        otp,
        filename: file.name,
        file_path: filePath,
        file_type: file.type,
        print_options: printOptions,
        upload_time: new Date().toISOString(),
        status: "pending" as const,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hours from now
      }

      await printJobStorage.set(otp, printJob)

      // Debug log
      const totalJobs = await printJobStorage.size()
      console.log(`Stored print job with OTP: ${otp}, Total jobs: ${totalJobs}`)

      return NextResponse.json({
        success: true,
        otp,
        message: "File uploaded successfully",
      })
    } catch (uploadError) {
      console.error('File upload failed:', uploadError)
      return NextResponse.json({ 
        error: "File upload failed", 
        details: uploadError.message 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error.message 
    }, { status: 500 })
  }
}
