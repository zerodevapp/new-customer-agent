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
    const categoryPhrase = category ? `; I'm also very into ${category}` : ''

    bodyText += `
I checked out ${companyName} and was very intrigued by what you are doing${categoryPhrase}.  If there's anything I can help with, feel free to [book a call](https://calendly.com/zerodev/30min) with me or [reach me on Telegram](https://t.me/derek_chiang).
`
  } else {
    bodyText += `
If there's anything I can help with, feel free to [book a call](https://calendly.com/zerodev/30min) with me or [reach me on Telegram](https://t.me/derek_chiang).
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
  // For testing, check if TEST_SEND_IMMEDIATELY is set to true
  if (process.env.TEST_SEND_IMMEDIATELY === "true") {
    // Send immediately by returning a date that's just 5 seconds in the future
    const now = new Date()
    return new Date(now.getTime() + 5 * 1000)
  }

  // Normal behavior - random time between minHours and maxHours
  const now = new Date()
  const hoursToAdd = minHours + Math.random() * (maxHours - minHours)
  const futureTime = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000)
  return futureTime
}