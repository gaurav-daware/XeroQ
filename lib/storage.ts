import { supabase, supabaseAdmin } from './supabase'

interface PrintJob {
  id?: string
  otp: string
  filename: string
  file_path: string
  file_type: string
  print_options: {
    colorMode: string
    copies: string
    duplex?: string
    paperSize?: string
    imageSize?: string
  }
  upload_time: string
  status: "pending" | "completed"
  expires_at: string
  completed_at?: string
}

class SupabaseStorage {
  async set(otp: string, job: Omit<PrintJob, "id">): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('print_jobs')
        .insert({
          otp,
          filename: job.filename,
          file_path: job.file_path,
          file_type: job.file_type,
          print_options: job.print_options,
          upload_time: job.upload_time,
          status: job.status,
          expires_at: job.expires_at,
        })

      if (error) {
        console.error('Error storing print job:', error)
        throw error
      }

      console.log(`Stored print job with OTP: ${otp}`)
    } catch (error) {
      console.error("Error storing print job:", error)
      throw error
    }
  }

  async get(otp: string): Promise<PrintJob | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('print_jobs')
        .select('*')
        .eq('otp', otp)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          console.log(`No print job found for OTP: ${otp}`)
          return null
        }
        throw error
      }

      if (data) {
        console.log(`Found print job for OTP: ${otp}`)
        return data
      }

      return null
    } catch (error) {
      console.error("Error retrieving print job:", error)
      throw error
    }
  }

  async delete(otp: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('print_jobs')
        .delete()
        .eq('otp', otp)

      if (error) {
        throw error
      }

      console.log(`Deleted print job with OTP: ${otp}`)
      return true
    } catch (error) {
      console.error("Error deleting print job:", error)
      return false
    }
  }

  async update(otp: string, updates: Partial<PrintJob>): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('print_jobs')
        .update(updates)
        .eq('otp', otp)

      if (error) {
        throw error
      }

      console.log(`Updated print job with OTP: ${otp}`)
      return true
    } catch (error) {
      console.error("Error updating print job:", error)
      return false
    }
  }

  async size(): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('print_jobs')
        .select('*', { count: 'exact', head: true })

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      console.error("Error getting collection size:", error)
      return 0
    }
  }

  async cleanup(): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('print_jobs')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) {
        throw error
      }

      console.log('Cleaned up expired print jobs')
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }

  async uploadFile(file: File, filename: string): Promise<string> {
    try {
      // Use supabaseAdmin for file uploads to bypass RLS
      const { data, error } = await supabaseAdmin.storage
        .from('print-files')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      console.log('File uploaded successfully:', data.path)
      return data.path
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }

  async downloadFile(filePath: string): Promise<Blob> {
    try {
      // Use supabaseAdmin for file downloads to bypass RLS
      const { data, error } = await supabaseAdmin.storage
        .from('print-files')
        .download(filePath)

      if (error) {
        console.error('Storage download error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error downloading file:", error)
      throw error
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      // Use supabaseAdmin for file deletion to bypass RLS
      const { error } = await supabaseAdmin.storage
        .from('print-files')
        .remove([filePath])

      if (error) {
        console.error('Storage delete error:', error)
        throw error
      }

      console.log('File deleted successfully:', filePath)
      return true
    } catch (error) {
      console.error("Error deleting file:", error)
      return false
    }
  }
}

// Create a singleton instance
const printJobStorage = new SupabaseStorage()

export default printJobStorage
