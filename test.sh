#!/usr/bin/env bash

# Simple test script for the email agent

# Check if an email was provided
if [ "$1" == "" ]; then
  echo "Please provide a test email address."
  echo "Usage: ./test.sh customer@example.com [Customer Name]"
  exit 1
fi

# Get the email from the first argument
EMAIL=$1

# Get the name from the second argument, or use "Test Customer" as default
NAME=${2:-"Test Customer"}

# Build the test email content
TEST_EMAIL="Customer email: $EMAIL
Customer description: $NAME"

echo "Running test with the following data:"
echo "----------------------------------------"
echo "$TEST_EMAIL"
echo "----------------------------------------"

# Run the agent with the test email
bun run src/index.ts "$TEST_EMAIL"