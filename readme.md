# Xeroq: Smart Printing & Xerox for Colleges

## Overview

Xeroq is a web platform that streamlines college print centers. Students upload documents/photos, set preferences, and use an OTP for contactless, queue-free printing. Admins retrieve and print instantly, reducing errors and wait times.

## Live Demo
Try Xeroq at [https://xeroq.vercel.app/](https://xeroq.vercel.app/).

## Features

### Students

- Upload documents/photos from any device.
- Set print preferences (copies, size, color, double-sided, photo settings).
- Receive unique OTP for secure retrieval.
- Manage jobs remotely, avoiding queues.

### Administrators

- Instant retrieval & printing via OTP.
- Digital queue management.
- Reduced errors through automation.
- Efficient request handling.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS / Custom CSS, Reusable Components.
- **Backend**: Python 3.x, Flask, Supabase (for Database & Storage).

## Installation & Setup

### Prerequisites

- Node.js & pnpm
- Python

### Frontend

```bash
cd Xeroq
pnpm install
pnpm dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python main.py
```

## How It Works

1. **Student Uploads**: File (document/photo) and preferences submitted.
2. **OTP Generated**: Unique OTP created for the job.
3. **Student Notifies Admin**: OTP provided at print center.
4. **Admin Prints**: Admin uses OTP to retrieve and print instantly.

# Benefits

## Reduced waiting times

- Contactless, secure printing
- Organized digital workflow
- Faster processing
- Improved student experience
