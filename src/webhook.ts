// Simple debug webhook server that logs incoming requests

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    // Log the request details
    console.log('------- NEW REQUEST -------')
    console.log(`Method: ${req.method}`)
    console.log(`URL: ${req.url}`)
    
    // Log headers
    console.log('Headers:')
    for (const [key, value] of req.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    // Try to log the body based on content type
    const contentType = req.headers.get('content-type') || ''
    console.log(`Content-Type: ${contentType}`)
    
    try {
      let body = 'Unable to parse body'
      if (contentType.includes('application/json')) {
        // Clone the request to avoid consuming the body
        const clonedReq = req.clone()
        const json = await clonedReq.json()
        body = JSON.stringify(json, null, 2)
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const clonedReq = req.clone()
        const formData = await clonedReq.formData()
        body = JSON.stringify(Object.fromEntries(formData.entries()), null, 2)
      } else {
        const clonedReq = req.clone()
        body = await clonedReq.text()
      }
      
      console.log('Body:')
      console.log(body)
    } catch (error) {
      console.log('Error parsing body:', error.message)
    }
    
    console.log('------- END REQUEST -------')
    
    // Always return a 200 success response for debugging
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Debug webhook received request and logged details' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  }
})

console.log(`Debug webhook server listening on port ${server.port}`)
console.log(`Ready to receive requests from Zapier!`)
console.log(`Once you see the request format, we can update the webhook to process emails.`)