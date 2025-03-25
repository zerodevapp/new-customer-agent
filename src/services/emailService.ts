import sgMail from '@sendgrid/mail'
import { EmailDetails } from '../types'

// Schedule an email to be sent at a specified time
export async function scheduleEmail(emailDetails: EmailDetails): Promise<boolean> {
  try {
    const { to, subject, body, sendAt } = emailDetails
    
    console.log(`Scheduling email to ${to} for ${sendAt.toISOString()}`)
    
    // Get API key from environment variables
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      throw new Error('SendGrid API key not found in environment variables')
    }
    
    // Set SendGrid API key
    sgMail.setApiKey(apiKey)
    
    // Parse sender email from environment variable
    const fromEmail = process.env.EMAIL_FROM?.split('<')[1]?.split('>')[0] || ''
    const fromName = process.env.FOUNDER_NAME || 'Derek'
    
    // Create email message
    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject,
      html: convertMarkdownToHtml(body),
      sendAt: Math.floor(sendAt.getTime() / 1000) // Convert to Unix timestamp
    }
    
    // Send the email
    await sgMail.send(msg)
    
    console.log(`Email scheduled successfully for ${sendAt.toLocaleString()}`)
    return true
  } catch (error) {
    console.error('Error scheduling email:', error)
    return false
  }
}

// Simple function to convert basic markdown to HTML
function convertMarkdownToHtml(markdown: string): string {
  // Convert line breaks
  let html = markdown.replace(/\n/g, '<br>')
  
  // Convert markdown links [text](url) to HTML links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  
  // Convert bold **text** to <strong>text</strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  
  // Convert italic *text* to <em>text</em>
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  
  return html
}