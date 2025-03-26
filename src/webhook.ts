// Enhanced debug webhook server that logs incoming requests in more detail

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
      // Always read the raw text first
      const clonedReq = req.clone()
      const rawBody = await clonedReq.text()
      console.log('Raw Body:')
      console.log(rawBody)
      console.log(`Body Length: ${rawBody.length} bytes`)
      
      // Try to parse as JSON if applicable
      if (contentType.includes('application/json') && rawBody) {
        try {
          const jsonBody = JSON.parse(rawBody)
          console.log('Parsed JSON Body:')
          console.log(JSON.stringify(jsonBody, null, 2))
          
          // Log key properties we might be interested in
          console.log('Notable Properties:')
          console.log('- body:', jsonBody.body)
          console.log('- email_body:', jsonBody.email_body)
          console.log('- content:', jsonBody.content)
          console.log('- data:', jsonBody.data)
          console.log('- html:', jsonBody.html)
          console.log('- text:', jsonBody.text)
          console.log('- subject:', jsonBody.subject)
          console.log('- from:', jsonBody.from)
        } catch (jsonError) {
          console.log('Error parsing JSON:', jsonError.message)
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        // For form data, recreate request and parse
        const formReq = new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: rawBody
        })
        
        try {
          const formData = await formReq.formData()
          console.log('Form Data:')
          for (const [key, value] of formData.entries()) {
            console.log(`- ${key}: ${value}`)
          }
        } catch (formError) {
          console.log('Error parsing form data:', formError.message)
        }
      }
    } catch (error) {
      console.log('Error reading body:', error.message)
      console.log(error.stack)
    }
    
    console.log('------- END REQUEST -------')
    
    // Always return a 200 success response for debugging
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Debug webhook received request and logged details. Check server logs for more information.' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  }
})

console.log(`Debug webhook server listening on port ${server.port}`)
console.log(`Ready to receive requests from Zapier!`)
console.log(`Once you see the request format, we can update the webhook to process emails.`)