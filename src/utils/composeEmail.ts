import { Customer, CompanyInfo, EmailDetails } from '../types'

export function composeEmail(customer: Customer, companyInfo: CompanyInfo): EmailDetails {
  const { email, name } = customer
  const { companyName, category } = companyInfo
  
  // Determine greeting
  const firstName = name ? name.split(' ')[0] : 'there'
  const greeting = name ? `Hi ${firstName},` : 'Hi there,'
  
  // Calculate random send time (24-48 hours from now)
  const sendAt = getRandomFutureTime(24, 48)
  
  let bodyText = `
${greeting}

This is Derek the founder of ZeroDev. I noticed that you recently signed up for ZeroDev -- how has the experience been?
`

  // Add company-specific content if available
  if (companyName) {
    const categoryPhrase = category ? `; I'm very into ${category}` : ''
    
    bodyText += `
I checked out ${companyName} and was very intrigued by what you are doing${categoryPhrase}.  If there's anything I can help with, feel free to [book a call with me](https://calendly.com/zerodev/30min) or [reach me on Telegram](https://t.me/derek_chiang).
`
  } else {
    bodyText += `
If there's anything I can help with, feel free to [book a call with me](https://calendly.com/zerodev/30min) or [reach me on Telegram](https://t.me/derek_chiang).
`
  }

  bodyText += `
Best,
Derek`

  // Clean up extra whitespace
  bodyText = bodyText.trim()

  return {
    to: email,
    subject: "ZeroDev experience?",
    body: bodyText,
    sendAt
  }
}

function getRandomFutureTime(minHours: number, maxHours: number): Date {
  const now = new Date()
  const hoursToAdd = minHours + Math.random() * (maxHours - minHours)
  const futureTime = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000)
  return futureTime
}