const { createClient } = require('@supabase/supabase-js')

async function setupSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    console.log('Required variables:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('Setting up Supabase for XeroQ...')

    // Create storage bucket for print files
    console.log('Creating storage bucket...')
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('print-files', {
        public: false,
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/bmp',
          'image/tiff',
          'image/webp'
        ],
        fileSizeLimit: 15728640 // 15MB
      })

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.error('Error creating bucket:', bucketError)
    } else {
      console.log('✅ Storage bucket created/verified')
    }

    // Test database connection
    console.log('Testing database connection...')
    const { data, error } = await supabase
      .from('print_jobs')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.error('Database connection error:', error)
      console.log('Please make sure you have run the SQL schema in your Supabase dashboard')
    } else {
      console.log('✅ Database connection successful')
    }

    console.log('\n🎉 Supabase setup completed!')
    console.log('\nNext steps:')
    console.log('1. Make sure your .env.local file has the correct Supabase credentials')
    console.log('2. Run the SQL schema in your Supabase dashboard (scripts/create-tables.sql)')
    console.log('3. Start your application with: npm run dev')

  } catch (error) {
    console.error('Setup error:', error)
    process.exit(1)
  }
}

setupSupabase()
