import { type NextRequest, NextResponse } from "next/server"
import printJobStorage from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const otp = searchParams.get("otp")

    const totalJobs = await printJobStorage.size()
    console.log(`Looking up OTP: ${otp}, Total jobs in database: ${totalJobs}`)

    if (!otp) {
      return NextResponse.json({ error: "OTP required" }, { status: 400 })
    }

    const printJob = await printJobStorage.get(otp)

    if (!printJob) {
      console.log(`Print job not found for OTP: ${otp}`)
      return NextResponse.json({ error: "Print job not found or expired" }, { status: 404 })
    }

    // Check if expired
    if (new Date() > new Date(printJob.expires_at)) {
      console.log(`Print job expired for OTP: ${otp}`)
      await printJobStorage.delete(otp)
      // Also delete the file from storage
      await printJobStorage.deleteFile(printJob.file_path)
      return NextResponse.json({ error: "Print job expired" }, { status: 404 })
    }

    console.log(`Found print job for OTP: ${otp}`)

    // Return job details without file data
    const jobDetails = {
      otp: printJob.otp,
      filename: printJob.filename,
      printOptions: printJob.print_options,
      uploadTime: printJob.upload_time,
      status: printJob.status,
      fileUrl: `/api/admin/download?otp=${otp}`,
    }

    return NextResponse.json(jobDetails)
  } catch (error) {
    console.error("Lookup error:", error)
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
  }
}
