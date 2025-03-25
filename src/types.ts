export interface Customer {
  email: string
  name?: string
}

export interface CompanyInfo {
  companyName?: string
  category?: string
}

export interface EmailDetails {
  to: string
  subject: string
  body: string
  sendAt: Date
}