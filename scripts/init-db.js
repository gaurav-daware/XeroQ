const { MongoClient } = require("mongodb")

async function initializeDatabase() {
  const connectionString = process.env.MONGODB_URI || "mongodb://localhost:27017/xeroq"

  try {
    console.log("Connecting to MongoDB...")
    const client = new MongoClient(connectionString)
    await client.connect()

    const db = client.db("xeroq")
    const collection = db.collection("printjobs")

    // Create TTL index for automatic document expiration
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

    // Create index on OTP for faster lookups
    await collection.createIndex({ otp: 1 }, { unique: true })

    // Create index on status for admin queries
    await collection.createIndex({ status: 1 })

    console.log("Database initialized successfully!")
    console.log("Indexes created:")
    console.log("- TTL index on expiresAt for automatic cleanup")
    console.log("- Unique index on otp for fast lookups")
    console.log("- Index on status for admin queries")

    await client.close()
    console.log("Database connection closed.")
  } catch (error) {
    console.error("Database initialization error:", error)
    process.exit(1)
  }
}

initializeDatabase()
