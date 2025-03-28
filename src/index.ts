import { parseCustomerEmail } from './utils/parseCustomerEmail'
import { analyzeCompanyWebsite } from './utils/analyzeCompanyWebsite'
import { composeEmail } from './utils/composeEmail'
import { scheduleEmail } from './services/emailService'
import { sendAuditEmail } from './services/auditService'
import { Customer } from './types'

// Function to process a "New Customer" email
async function processNewCustomerEmail(emailBody: string): Promise<void> {
  console.log('Processing new customer email...')
  
  try {
    // Step 1: Parse the customer email to extract email and name
    const customer = parseCustomerEmail(emailBody)
    
    if (!customer) {
      console.log('No valid customer data found or email is generic')
      // Send audit email for skipped customer
      await sendAuditEmail('skipped', {
        reason: 'No valid customer data found or email is generic',
        originalEmail: emailBody
      })
      return
    }
    
    console.log(`Found customer: ${customer.email} ${customer.name ? `(${customer.name})` : ''}`)
    
    // Step 2: Analyze the customer's website
    let companyInfo
    try {
      companyInfo = await analyzeCompanyWebsite(customer.email)
      
      if (companyInfo.companyName) {
        console.log(`Company: ${companyInfo.companyName}${companyInfo.category ? `, Category: ${companyInfo.category}` : ''}`)
      } else {
        console.log('Could not determine company information')
      }
    } catch (error) {
      console.error('Error analyzing company website:', error)
      companyInfo = {
        companyName: customer.email.split('@')[1].split('.')[0],
        category: undefined
      }
    }
    
    // Step 3: Compose a personalized email
    const emailDetails = await composeEmail(customer, companyInfo)
    
    console.log(`Email composed with subject: "${emailDetails.subject}"`)
    console.log(`Scheduled to send at: ${emailDetails.sendAt.toLocaleString()}`)
    
    // Print the email body if in test mode
    if (process.env.TEST_SEND_IMMEDIATELY === "true") {
      console.log("\n--- EMAIL PREVIEW ---")
      console.log(`To: ${emailDetails.to}`)
      console.log(`Subject: ${emailDetails.subject}`)
      console.log("\nBody:")
      console.log(emailDetails.body)
      console.log("--- END PREVIEW ---\n")
    }
    
    // Step 4: Schedule the email to be sent
    const scheduled = await scheduleEmail(emailDetails)
    
    if (scheduled) {
      console.log('Email scheduled successfully')
      
      // Send audit email for success
      await sendAuditEmail('success', {
        customer,
        companyInfo,
        emailDetails,
        originalEmail: emailBody
      })
    } else {
      console.error('Failed to schedule email')
      
      // Send audit email for error
      await sendAuditEmail('error', {
        customer,
        companyInfo,
        emailDetails,
        error: 'Failed to schedule email',
        originalEmail: emailBody
      })
    }
  } catch (error) {
    console.error('Error processing customer email:', error)
    
    // Send audit email for error
    await sendAuditEmail('error', {
      error,
      originalEmail: emailBody
    })
  }
}

// Main function - entry point
async function main(): Promise<void> {
  // Check if email body was provided as command-line argument
  const emailBody = process.argv[2]
  
  if (!emailBody) {
    console.error('Please provide the "New Customer" email body as a command-line argument')
    console.error('Example: bun run src/index.ts "Customer email: customer@example.com\\nCustomer description: John Doe"')
    process.exit(1)
  }
  
  await processNewCustomerEmail(emailBody)
}

// Only run the main function if this file is executed directly (not imported)
// Check if this is the main module being run
if (import.meta.url === Bun.main) {
  main().catch(error => {
    console.error('Error in main function:', error)
    process.exit(1)
  })
}

// Export the processNewCustomerEmail function for potential use in other contexts (e.g., API endpoints)
export { processNewCustomerEmail }