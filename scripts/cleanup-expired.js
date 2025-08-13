const { MongoClient } = require("mongodb")

async function cleanupExpiredJobs() {
  const connectionString = process.env.MONGODB_URI || "mongodb://localhost:27017/xeroq"

  try {
    console.log("Connecting to MongoDB...")
    const client = new MongoClient(connectionString)
    await client.connect()

    const db = client.db("xeroq")
    const collection = db.collection("printjobs")

    // Find and delete expired documents
    const result = await collection.deleteMany({
      expiresAt: { $lt: new Date() },
    })

    console.log(`Cleaned up ${result.deletedCount} expired print jobs`)

    // Get current statistics
    const totalJobs = await collection.countDocuments()
    const pendingJobs = await collection.countDocuments({ status: "pending" })
    const completedJobs = await collection.countDocuments({ status: "completed" })

    console.log("\nCurrent Statistics:")
    console.log(`Total jobs: ${totalJobs}`)
    console.log(`Pending jobs: ${pendingJobs}`)
    console.log(`Completed jobs: ${completedJobs}`)

    await client.close()
    console.log("\nCleanup completed successfully!")
  } catch (error) {
    console.error("Cleanup error:", error)
    process.exit(1)
  }
}

cleanupExpiredJobs()
