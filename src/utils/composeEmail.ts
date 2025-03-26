import { Customer, CompanyInfo, EmailDetails } from '../types'
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"

// Function to determine appropriate greeting using AI
async function getAIGreeting(name: string | undefined): Promise<string> {
  if (!name) return 'Hi there,'
  
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0
    })
    
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an AI assistant that analyzes names to determine appropriate email greetings.
      
      Customer name: {name}
      
      Please determine if this appears to be:
      1. A personal name (like "John Smith")
      2. A company or team name (like "Acme Corp" or "The DevOps Team")
      
      If it's a personal name, extract the appropriate first name to use in a greeting.
      If it's a company/team name or if you're unsure, use a generic greeting.
      
      IMPORTANT: 
      - Don't explain your reasoning
      - Don't use markdown or formatting
      - Don't include quotes around your response unless they're part of the greeting
      - Return ONLY the exact greeting text
      
      Respond with ONLY a greeting in one of these formats:
      For personal names: Hi FirstName,
      For company names or unclear: Hi there,
    `)
    
    const chain = prompt.pipe(model).pipe(new StringOutputParser())
    
    const result = await chain.invoke({
      name
    })
    
    // Clean up any extra whitespace and ensure proper format
    return result.trim()
  } catch (error) {
    console.error("Error generating AI greeting:", error)
    // Fall back to simple greeting if there's an error
    return name ? `Hi ${name.split(' ')[0]},` : 'Hi there,'
  }
}

export async function composeEmail(customer: Customer, companyInfo: CompanyInfo): Promise<EmailDetails> {
  const { email, name } = customer
  const { companyName, category } = companyInfo

  // Determine greeting using AI
  const greeting = await getAIGreeting(name)

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