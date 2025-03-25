# AI agent for emailing new customers

## Background

I am the CEO of ZeroDev.  ZeroDev is a company that offers embedded smart accounts as a service to Web3 companies.  Our customers include DApps and wallets who want to use smart accounts (ERC-4337) to improve their user experience.

One thing I do is to look at customers who signed up for ZeroDev recently, then send a personalized email to them to ask for their experience and offer to connect, either over a call or over Slack/Telegram.  I have found this to be very effective at engaging customers who may otherwise fall off.

However, this process is quite time-consuming and I often forget to do it.  So I want to build an AI agent that will do it on my behalf.

## How it works

On a high level, the agent should work like this:

- When I receive an email with the title "New Customer," the agent should be triggered.
  - I have already set up a Zapier automation where I get an email titled "New Customer" whenever someone signs up.

- The agent should read the email, which will contain the email address of the new customer.

- The agent should then visit the website associated with the email to understand what the customer's project is doing.
  - If the user signed up with a generic email like a gmail, we can ignore them.

- The agent should then compose a "personalized" email for the customer, and schedule to send it from my account at a random point in the future, say a random time between 24h to 48h from when the customer signed up.

## Email format

### "New Customer" email

Here's an example of the body of a real "New Customer" email:

```
Customer email: andres@agroearn.com
Customer description: Andres Gutierrez

---------------------------------------------------------------------------
Visit this link to stop these emails: https://zapier.com/manage/zaps/189050400/stop/?check=IjE4OTA1MDQwMCI:1tx0LG:ALMAN9BybZK0EPfUwIxkrMHB9s23vpWunPWFn_ffHqM
```

As you see, the email contains the email address and name of the customer.  All "New Customer" emails will be in this format.

Note that sometimes the name is not available, or it's clearly not a real name.  In that case, we should address the customer as "Hi there."  If the full name is available, we address the customer by their first name.

### "ZeroDev experience?" email

And here's the real email I sent to that customer:

```
Title: ZeroDev experience?

Body:

Hi Andres,

This is Derek the founder of ZeroDev.  I noticed that you recently signed up for ZeroDev -- how has the experience been?

I checked out Agro Earn and was very intrigued by what you are doing; I'm very into DeFi myself.  If there's anything I can help with, feel free to [book a call with me](https://calendly.com/zerodev/30min) or [reach me on Telegram](https://t.me/derek_chiang).

Best,
Derek
```

Note that I want the agent to use this exact template.  The only parts that the agent should customize are:

- The name of the company.  In this example it's `Agro Earn` but it should be customized to the customer's actual company name.
  - If for whatever reason we can't find the customer's company name, we can skip the "I checked out...; I'm very into..." part completely.

- The thing that follows "I'm very into...".  In this case, Agro Earn is a DeFi company, so I said DeFi.  In general, this should just be a word or a very short phrase that captures the category of what the company is doing.

Again, other than the aforementioned parts, the email should be EXACTLY the same as the one I shared.  And the title is ALWAYS "ZeroDev experience?"

## Tech stack

Let's use TypeScript and Langchain.  Make sure to use the latest langchain version "0.3.19" with docs here: https://js.langchain.com/docs/introduction/

For coding style, make sure to not use ";" to end TypeScript lines.