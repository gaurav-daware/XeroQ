import { type NextRequest, NextResponse } from "next/server"
import printJobStorage from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const otp = searchParams.get("otp")

    if (!otp) {
      return NextResponse.json({ error: "OTP required" }, { status: 400 })
    }

    const printJob = await printJobStorage.get(otp)

    if (!printJob) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check if expired
    if (new Date() > new Date(printJob.expires_at)) {
      await printJobStorage.delete(otp)
      await printJobStorage.deleteFile(printJob.file_path)
      return NextResponse.json({ error: "File expired" }, { status: 404 })
    }

    // Download file from Supabase Storage
    const fileBlob = await printJobStorage.downloadFile(printJob.file_path)

    // Convert blob to buffer
    const buffer = await fileBlob.arrayBuffer()

    // Return the file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": printJob.file_type,
        "Content-Disposition": `attachment; filename="${printJob.filename}"`,
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
