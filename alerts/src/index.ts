import * as dotenv from "dotenv"
dotenv.config()
import * as cron from "node-cron"
import { messages } from "./alerts/messages"
import { sendMessage } from "./slack"

// Configuration from environment variables
const SCHEDULE_ENABLED = process.env.SCHEDULE_ENABLED === 'true'
const SCHEDULE_CRON = process.env.SCHEDULE_CRON || '0 */15 * * * *' // Default: every 15 minutes
const RUN_ONCE_ON_START = process.env.RUN_ONCE_ON_START === 'true'

let isRunning = false
let runCount = 0
let lastRunTime: Date | null = null
let lastError: Error | null = null

const runAlerts = async () => {
  if (isRunning) {
    console.log('⏳ Alert job already running, skipping this execution')
    return
  }

  isRunning = true
  runCount++
  const startTime = new Date()
  
  try {
    console.log(`🚀 Starting alert job #${runCount} at ${startTime.toISOString()}`)
    
    const msgs = await messages()
    console.log(`📊 Generated ${msgs.length} alert message(s)`)
    
    if (msgs.length > 0) {
      console.log('📤 Sending messages to Slack...')
      const promises = msgs.map((msg, index) => {
        console.log(`  ${index + 1}. ${msg.title} (${msg.type})`)
        return sendMessage(msg)
      })
      
      await Promise.all(promises)
      console.log(`✅ Successfully sent ${msgs.length} message(s)`)
    } else {
      console.log('ℹ️  No alerts to send - all systems normal')
    }
    
    lastRunTime = startTime
    lastError = null
    
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error))
    console.error('❌ Alert job failed:', lastError.message)
    console.error('Stack trace:', lastError.stack)
  } finally {
    isRunning = false
    const duration = Date.now() - startTime.getTime()
    console.log(`⏱️  Alert job #${runCount} completed in ${duration}ms\n`)
  }
}

const startScheduler = () => {
  console.log('🕒 Starting scheduled alert system...')
  console.log(`⚙️  Schedule: ${SCHEDULE_CRON}`)
  console.log(`🔄 Run once on start: ${RUN_ONCE_ON_START}`)
  
  // Validate cron expression
  if (!cron.validate(SCHEDULE_CRON)) {
    throw new Error(`Invalid cron expression: ${SCHEDULE_CRON}`)
  }
  
  // Schedule the job
  const task = cron.schedule(SCHEDULE_CRON, () => {
    runAlerts().catch(error => {
      console.error('🔥 Unhandled error in scheduled task:', error)
    })
  }, {
    scheduled: false
  })
  
  // Start the scheduler
  task.start()
  console.log('✅ Scheduler started successfully')
  
  // Run immediately if configured
  if (RUN_ONCE_ON_START) {
    console.log('🏃 Running alerts immediately on startup...')
    setTimeout(() => runAlerts(), 1000)
  }
  
  // Health check endpoint (log status every hour)
  setInterval(() => {
    const status = {
      isRunning,
      runCount,
      lastRunTime: lastRunTime?.toISOString(),
      lastError: lastError?.message,
      nextRun: 'Based on cron schedule',
      uptime: process.uptime()
    }
    console.log('📊 Alert system status:', JSON.stringify(status, null, 2))
  }, 60 * 60 * 1000) // Every hour
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, stopping scheduler...')
    task.stop()
    console.log('✅ Scheduler stopped gracefully')
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, stopping scheduler...')
    task.stop()
    console.log('✅ Scheduler stopped gracefully')
    process.exit(0)
  })
}

// Main execution logic
const main = async () => {
  console.log('🔧 Bridge Monitor Alert System')
  console.log('================================')
  
  if (SCHEDULE_ENABLED) {
    startScheduler()
    
    // Keep the process alive
    setInterval(() => {
      // This keeps the Node.js process running
    }, 60000)
  } else {
    console.log('📝 Running in one-time mode...')
    await runAlerts()
    console.log('🏁 One-time execution completed')
    process.exit(0)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

main().catch(error => {
  console.error('💥 Failed to start alert system:', error)
  process.exit(1)
})
