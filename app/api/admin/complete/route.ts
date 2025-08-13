import { type NextRequest, NextResponse } from "next/server"
import printJobStorage from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { otp } = await request.json()

    if (!otp) {
      return NextResponse.json({ error: "OTP required" }, { status: 400 })
    }

    const printJob = await printJobStorage.get(otp)

    if (!printJob) {
      return NextResponse.json({ error: "Print job not found" }, { status: 404 })
    }

    // Update status to completed
    const updated = await printJobStorage.update(otp, {
      status: "completed",
      completed_at: new Date().toISOString(),
    })

    if (!updated) {
      return NextResponse.json({ error: "Failed to update job status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Print job marked as completed",
    })
  } catch (error) {
    console.error("Complete error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
