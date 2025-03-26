import { processNewCustomerEmail } from './index'
import { sendAuditEmail } from './services/auditService'

// Webhook server to handle incoming requests from Zapier
const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      // Parse the webhook payload
      const contentType = req.headers.get('content-type') || ''
      
      if (!contentType.includes('application/json')) {
        return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      // Read the request body
      const body = await req.text()
      if (!body) {
        return new Response(JSON.stringify({ error: 'Empty request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      // Parse JSON
      let data
      try {
        data = JSON.parse(body)
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      // Log incoming data for monitoring
      console.log(`[${new Date().toISOString()}] Received webhook:`, JSON.stringify(data))
      
      // Extract customer information from Zapier's format
      const { name, email } = data
      
      if (!email) {
        return new Response(JSON.stringify({ error: 'Missing email in payload' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      // Format the data in the expected format for our processor
      const customerEmail = `Customer email: ${email}\nCustomer description: ${name || ''}`
      
      // Process the customer email in a separate async context
      // to respond quickly to Zapier
      setTimeout(async () => {
        try {
          await processNewCustomerEmail(customerEmail)
          console.log(`[${new Date().toISOString()}] Successfully processed customer: ${email}`)
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error processing customer ${email}:`, error)
          
          // Send audit email about processing error
          await sendAuditEmail('error', {
            customer: { email, name },
            error,
            originalEmail: customerEmail
          })
        }
      }, 0)
      
      // Return success response immediately
      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook received and processing started',
        customerEmail: email,
        customerName: name || '(not provided)'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error handling webhook:`, error)
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
})

console.log(`[${new Date().toISOString()}] Webhook server running on port ${server.port}`)
console.log(`Ready to process customer emails from Zapier`)