import sgMail from '@sendgrid/mail'
import { Customer, CompanyInfo, EmailDetails } from '../types'

// Send an audit email for tracking and monitoring purposes
export async function sendAuditEmail(
  status: 'success' | 'error' | 'skipped',
  details: {
    customer?: Customer,
    companyInfo?: CompanyInfo,
    emailDetails?: EmailDetails,
    error?: Error | string,
    reason?: string,
    originalEmail?: string
  }
): Promise<boolean> {
  try {
    const auditEmail = process.env.AUDIT_EMAIL_RECIPIENT
    if (!auditEmail) {
      console.log('No audit email recipient configured, skipping audit email')
      return false
    }

    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      console.error('SendGrid API key not found in environment variables')
      return false
    }

    // Set SendGrid API key
    sgMail.setApiKey(apiKey)

    // Parse sender email from environment variable
    const fromEmail = process.env.EMAIL_FROM?.split('<')[1]?.split('>')[0] || ''
    const fromName = 'ZeroDev Email Agent'

    // Create audit email subject
    const subject = `[Email Agent Audit] ${status.toUpperCase()}: ${details.customer?.email || 'Unknown Customer'}`

    // Create the audit email body
    let body = `
<h2>Email Agent Audit Report</h2>
<p><strong>Status:</strong> ${status.toUpperCase()}</p>
<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
`

    if (details.customer) {
      body += `
<h3>Customer Details</h3>
<ul>
  <li><strong>Email:</strong> ${details.customer.email}</li>
  <li><strong>Name:</strong> ${details.customer.name || 'Not provided'}</li>
</ul>
`
    }

    if (details.companyInfo) {
      body += `
<h3>Company Analysis</h3>
<ul>
  <li><strong>Company Name:</strong> ${details.companyInfo.companyName || 'Not determined'}</li>
  <li><strong>Category:</strong> ${details.companyInfo.category || 'Not determined'}</li>
</ul>
`
    }

    if (status === 'success' && details.emailDetails) {
      body += `
<h3>Email Details</h3>
<ul>
  <li><strong>To:</strong> ${details.emailDetails.to}</li>
  <li><strong>Subject:</strong> ${details.emailDetails.subject}</li>
  <li><strong>Scheduled For:</strong> ${details.emailDetails.sendAt.toLocaleString()}</li>
</ul>

<h4>Email Body:</h4>
<div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; background-color: #f9f9f9;">
  ${details.emailDetails.body.replace(/\n/g, '<br>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')}
</div>
`
    }

    if (status === 'error' && details.error) {
      const errorMessage = typeof details.error === 'string' 
        ? details.error 
        : (details.error.message || 'Unknown error')
      
      body += `
<h3>Error Details</h3>
<p style="color: red;">${errorMessage}</p>
<pre>${typeof details.error === 'string' ? '' : (details.error.stack || '')}</pre>
`
    }

    if (status === 'skipped' && details.reason) {
      body += `
<h3>Skipped Reason</h3>
<p>${details.reason}</p>
`
    }

    if (details.originalEmail) {
      body += `
<h3>Original Email Content</h3>
<pre>${details.originalEmail}</pre>
`
    }

    // Add footer
    body += `
<hr>
<p><small>This is an automated message from the ZeroDev Email Agent.</small></p>
`

    // Create email message
    const msg = {
      to: auditEmail,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject,
      html: body,
      // Send immediately
      sendAt: Math.floor(new Date().getTime() / 1000) + 1
    }

    // Send the email
    await sgMail.send(msg)
    console.log(`Audit email sent to ${auditEmail}`)
    return true
  } catch (error) {
    console.error('Error sending audit email:', error)
    return false
  }
}