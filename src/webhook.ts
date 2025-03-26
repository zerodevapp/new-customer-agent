// Enhanced debug webhook server with low-level request capture

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    // Log the request details
    console.log('\n============= NEW REQUEST =============')
    console.log(`Timestamp: ${new Date().toISOString()}`)
    console.log(`Method: ${req.method}`)
    console.log(`URL: ${req.url}`)
    
    // Create a log function that handles undefined values
    const logValue = (name: string, value: any) => {
      const output = value === undefined ? 'undefined' : 
                     value === null ? 'null' :
                     typeof value === 'string' ? `"${value}"` : 
                     `${value}`
      console.log(`${name}: ${output}`)
    }
    
    // Check for basic authentication
    const authHeader = req.headers.get('authorization') || ''
    if (authHeader.startsWith('Basic ')) {
      try {
        const base64Credentials = authHeader.split(' ')[1]
        const credentials = atob(base64Credentials)
        const [username, password] = credentials.split(':')
        console.log(`Authentication: Username="${username}", Password=<redacted>`)
      } catch (e) {
        console.log(`Authentication: Error decoding (${e.message})`)
      }
    }
    
    // Log all headers
    console.log('\nRequest Headers:')
    for (const [key, value] of req.headers.entries()) {
      // Skip logging the full authorization header
      if (key.toLowerCase() === 'authorization') {
        console.log(`  ${key}: <redacted>`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }
    
    // Get reference to request data using multiple methods
    console.log('\nCapturing request body...')
    
    try {
      // Clone the request for different body reading methods
      const textReq = req.clone()
      const bufferReq = req.clone()
      
      // 1. Try reading as text
      let bodyText = ''
      try {
        bodyText = await textReq.text()
        console.log(`Raw body text (${bodyText.length} bytes):`)
        console.log(bodyText || '(empty string)')
      } catch (e) {
        console.log(`Error reading body as text: ${e.message}`)
      }
      
      // 2. Try reading as ArrayBuffer for raw bytes analysis
      try {
        const buffer = await bufferReq.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        console.log(`\nRaw body bytes (${bytes.length} bytes):`);
        
        if (bytes.length > 0) {
          // Print first 100 bytes in hex
          const hex = Array.from(bytes.slice(0, Math.min(100, bytes.length)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ')
          console.log(`Hex: ${hex}${bytes.length > 100 ? ' ...' : ''}`)
          
          // Try to show as ASCII
          const ascii = Array.from(bytes.slice(0, Math.min(100, bytes.length)))
            .map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : '.')
            .join('')
          console.log(`ASCII: ${ascii}${bytes.length > 100 ? ' ...' : ''}`)
        } else {
          console.log('(empty buffer)')
        }
      } catch (e) {
        console.log(`Error reading body as buffer: ${e.message}`)
      }
      
      // 3. Parse body if it's present and appears to be JSON
      if (bodyText && bodyText.trim() && bodyText.trim().startsWith('{')) {
        try {
          const jsonBody = JSON.parse(bodyText)
          console.log('\nParsed JSON:')
          console.log(JSON.stringify(jsonBody, null, 2))
        } catch (e) {
          console.log(`Error parsing JSON: ${e.message}`)
        }
      }
    } catch (error) {
      console.log(`Error reading request body: ${error.message}`)
    }
    
    // Let's directly examine the test content that should be coming from Zapier
    console.log('\nTest data that we expect from Zapier:')
    console.log('Customer email: test@example.com\nCustomer description: Test User')
    
    console.log('\nPlease update your Zapier action to send proper data with email body')
    console.log('============= END REQUEST =============\n')
    
    // Send a detailed response
    return new Response(JSON.stringify({ 
      success: true, 
      received: new Date().toISOString(),
      info: "Test connection successful. Configure Zapier to send email data with the proper format.",
      expected_format: {
        "body": "Customer email: customer@example.com\nCustomer description: Customer Name"
      },
      note: "Check server logs for more information."
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  }
})

console.log(`Debug webhook server listening on port ${server.port}`)
console.log(`Ready to receive requests from Zapier!`)
console.log(`Make sure Zapier is properly configured to include the email body.`)