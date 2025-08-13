-- Create the print_jobs table
CREATE TABLE IF NOT EXISTS print_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    otp VARCHAR(6) UNIQUE NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    print_options JSONB NOT NULL,
    upload_time TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_print_jobs_otp ON print_jobs(otp);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_expires_at ON print_jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_print_jobs_upload_time ON print_jobs(upload_time);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_print_jobs_updated_at 
    BEFORE UPDATE ON print_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (optional - for additional security)
CREATE POLICY "Enable read access for service role" ON print_jobs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for service role" ON print_jobs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for service role" ON print_jobs
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for service role" ON print_jobs
    FOR DELETE USING (true);
