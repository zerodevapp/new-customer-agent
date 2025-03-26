import axios from 'axios'
import * as cheerio from 'cheerio'
import { CompanyInfo } from '../types'
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"

export async function analyzeCompanyWebsite(email: string): Promise<CompanyInfo> {
  try {
    const domain = email.split('@')[1]
    const url = `https://${domain}`

    console.log(`Fetching website content from ${url}...`)

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    const html = response.data
    const $ = cheerio.load(html)

    // Extract text content from the website
    const bodyText = $('body').text().replace(/\\s+/g, ' ').trim()
    const title = $('title').text().trim()
    const metaDescription = $('meta[name="description"]').attr('content') || ''

    // Use only the first 2000 characters to avoid hitting token limits
    const truncatedContent = `
      Title: ${title}
      Description: ${metaDescription}
      Content: ${bodyText.substring(0, 2000)}
    `

    // Use LLM to analyze the website content
    return await analyzeWithLLM(truncatedContent, domain)
  } catch (error) {
    console.error(`Error analyzing website for ${email}:`, error)
    return {}
  }
}

async function analyzeWithLLM(websiteContent: string, domain: string): Promise<CompanyInfo> {
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0
  })

  const prompt = ChatPromptTemplate.fromTemplate(`
    You are an AI assistant that analyzes website content to extract company information.
    
    Website Content:
    {websiteContent}
    
    Domain: {domain}
    
    Context:
    - This is for ZeroDev, a Web3 company that provides embedded smart accounts service to Web3 companies
    - All ZeroDev customers are already in Web3/crypto, so those are not meaningful specific categories
    - The category must be specific enough that a human would genuinely say "I'm very into [category]" in conversation
    - Generic terms like "platforms", "protocols", "apps", "wallets", "smart contracts" are not specific enough
    - Good examples: "DeFi", "GameFi", "NFTs", "DAOs", "play-to-earn", etc.
    
    Based on the above information, please determine:
    1. The company name (extract it if present, otherwise use the domain name without '.com' etc.)
    2. A specific category that describes what the company does (must be specific enough that someone could genuinely say "I'm very into [category]")
    
    IMPORTANT: Your response MUST be valid JSON without any explanations, markdown formatting, or backticks.
    
    Respond ONLY in this exact JSON format:
    {{"companyName": "COMPANY_NAME_HERE", "category": "CATEGORY_HERE"}}
    
    If the category isn't specific or meaningful enough to mention in conversation (e.g., too generic or just "Web3"), set it to null.
    Don't capitalize the category unless it's actually known to be capitalized.
    If you can't determine company name, use null.
    
    Do not include any text before or after the JSON object. Return only the JSON.
  `)

  const chain = prompt.pipe(model).pipe(new StringOutputParser())

  try {
    const result = await chain.invoke({
      websiteContent,
      domain
    })

    const parsed = JSON.parse(result)
    return {
      companyName: parsed.companyName || undefined,
      category: parsed.category || undefined
    }
  } catch (error) {
    console.error("Error parsing LLM response:", error)
    // Fall back to domain-based company name
    return {
      companyName: domain.split('.')[0],
      category: undefined
    }
  }
}