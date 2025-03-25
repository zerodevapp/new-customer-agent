# ZeroDev Email Agent for New Customers

An AI agent that automatically processes "New Customer" emails and sends personalized follow-up emails to new ZeroDev customers.

## Features

- Parses "New Customer" email notifications
- Visits the customer's website to understand their project
- Analyzes company information to determine the company name and category
- Composes a personalized email based on the template
- Schedules the email to be sent at a random time (24-48 hours in the future)

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- SendGrid API key (for sending emails)
- OpenAI API key (for content analysis)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd email-new-customers
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Create a `.env` file based on the `.env.example` file:
   ```
   cp .env.example .env
   ```

4. Fill in your API keys and email settings in the `.env` file

## Usage

### Running the agent

```bash
# Build the TypeScript
bun run build

# Process a new customer email
bun run dist/index.js "Customer email: customer@example.com
Customer description: John Doe"
```

For development:

```bash
bun run src/index.ts "Customer email: customer@example.com
Customer description: John Doe"
```

### Testing locally

For convenient testing, you can use the included test script:

```bash
# Make the script executable if needed
chmod +x test.sh

# Run a test with a specific email and optional name
./test.sh customer@example.com "John Doe"
```

To send test emails immediately instead of waiting 24-48 hours:

1. Set `TEST_SEND_IMMEDIATELY=true` in your `.env` file
2. Run the test as normal
3. Set it back to `false` for production use

## How It Works

1. The agent is triggered when it receives a "New Customer" email.
2. It extracts the customer's email address and name from the notification.
3. If the email is a generic email (like Gmail), it ignores the customer.
4. Otherwise, it visits the website associated with the customer's email domain.
5. It analyzes the website to determine the company name and category.
6. It composes a personalized email based on the template.
7. It schedules the email to be sent at a random time in the future (24-48 hours).

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `SENDGRID_API_KEY`: Your SendGrid API key
- `EMAIL_FROM`: The email address to send from (format: "Derek <email@example.com>")
- `FOUNDER_NAME`: The founder's name (default: "Derek")