const { createClient } = require('@supabase/supabase-js')

async function cleanupExpiredJobs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('Cleaning up expired print jobs...')

    // Get expired jobs first to delete their files
    const { data: expiredJobs, error: fetchError } = await supabase
      .from('print_jobs')
      .select('file_path')
      .lt('expires_at', new Date().toISOString())

    if (fetchError) {
      throw fetchError
    }

    // Delete files from storage
    if (expiredJobs && expiredJobs.length > 0) {
      const filePaths = expiredJobs.map(job => job.file_path)
      const { error: storageError } = await supabase.storage
        .from('print-files')
        .remove(filePaths)

      if (storageError) {
        console.warn('Some files could not be deleted from storage:', storageError)
      }
    }

    // Delete expired database records
    const { error: deleteError } = await supabase
      .from('print_jobs')
      .delete()
      .lt('expires_at', new Date().toISOString())

    if (deleteError) {
      throw deleteError
    }

    console.log(`✅ Cleaned up ${expiredJobs?.length || 0} expired print jobs`)

    // Get current statistics
    const { data: stats, error: statsError } = await supabase
      .from('print_jobs')
      .select('status')

    if (statsError) {
      throw statsError
    }

    const totalJobs = stats?.length || 0
    const pendingJobs = stats?.filter(job => job.status === 'pending').length || 0
    const completedJobs = stats?.filter(job => job.status === 'completed').length || 0

    console.log('\n📊 Current Statistics:')
    console.log(`Total jobs: ${totalJobs}`)
    console.log(`Pending jobs: ${pendingJobs}`)
    console.log(`Completed jobs: ${completedJobs}`)

    console.log('\n🎉 Cleanup completed successfully!')

  } catch (error) {
    console.error('Cleanup error:', error)
    process.exit(1)
  }
}

cleanupExpiredJobs()
