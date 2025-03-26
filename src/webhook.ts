// Enhanced debug webhook server that handles authentication and logs requests

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    // Log the request details
    console.log('------- NEW REQUEST -------')
    console.log(`Method: ${req.method}`)
    console.log(`URL: ${req.url}`)
    
    // Check for authentication
    const authHeader = req.headers.get('authorization') || ''
    if (authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1]
      const credentials = atob(base64Credentials)
      const [username, password] = credentials.split(':')
      
      console.log(`Authentication: Username=${username}, Password=${password.replace(/./g, '*')}`)
      
      // This is just for logging - in production you'd validate against actual credentials
      console.log('Authentication Status: ' + (username === 'test_username' && password === 'test_password' ? 'Valid' : 'Invalid'))
    } else {
      console.log('No authentication provided')
    }
    
    // Log headers
    console.log('Headers:')
    for (const [key, value] of req.headers.entries()) {
      if (key !== 'authorization') { // Don't log auth header again
        console.log(`  ${key}: ${value}`)
      }
    }
    
    // Handle empty requests (like Zapier connection tests)
    const contentLength = parseInt(req.headers.get('content-length') || '0')
    if (contentLength === 0) {
      console.log('Empty request body (likely a connection test)')
      console.log('------- END REQUEST -------')
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Connection test successful' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
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
      if (contentType.includes('application/json') && rawBody.trim()) {
        try {
          const jsonBody = JSON.parse(rawBody)
          console.log('Parsed JSON Body:')
          console.log(JSON.stringify(jsonBody, null, 2))
          
          // Examine the structure more deeply
          console.log('JSON Structure:')
          const examine = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return
            
            for (const [key, value] of Object.entries(obj)) {
              const currentPath = path ? `${path}.${key}` : key
              const valueType = typeof value
              const preview = valueType === 'string' ? 
                (value.length > 50 ? `"${value.substring(0, 50)}..."` : `"${value}"`) : 
                value
              
              console.log(`- ${currentPath}: (${valueType}) ${preview}`)
              
              // Recurse into objects (but not arrays to avoid huge output)
              if (valueType === 'object' && value !== null && !Array.isArray(value)) {
                examine(value, currentPath)
              }
            }
          }
          
          examine(jsonBody)
        } catch (jsonError) {
          console.log('Error parsing JSON:', jsonError.message)
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        // Handle form data
        try {
          const params = new URLSearchParams(rawBody)
          console.log('Form Data:')
          for (const [key, value] of params.entries()) {
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
      requestReceived: true,
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