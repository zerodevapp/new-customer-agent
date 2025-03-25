import { Customer } from '../types'

export function parseCustomerEmail(emailBody: string): Customer | null {
  try {
    // Extract customer email
    const emailMatch = emailBody.match(/Customer email:\s*([\w.+-]+@[\w-]+\.[\w.-]+)/i)
    if (!emailMatch) return null
    
    const email = emailMatch[1]
    
    // Check if it's a generic email (Gmail, etc.)
    if (isGenericEmail(email)) return null
    
    // Extract customer name if available
    const nameMatch = emailBody.match(/Customer description:\s*([^\n]+)/i)
    const fullName = nameMatch ? nameMatch[1].trim() : undefined
    
    return {
      email,
      name: fullName
    }
  } catch (error) {
    console.error('Error parsing customer email:', error)
    return null
  }
}

function isGenericEmail(email: string): boolean {
  const genericDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'mail.com',
    'protonmail.com',
    'zoho.com'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  return genericDomains.includes(domain)
}