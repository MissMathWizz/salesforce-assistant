import { NextResponse } from "next/server"

// API endpoint - would be replaced with the actual Salesforce earnings call API
const API_URL = "https://gemini-api-519156211042.us-central1.run.app/ask"

export async function POST(request: Request) {
  try {
    // Get the question from the request
    const { question } = await request.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required and must be a string" }, { status: 400 })
    }

    console.log("Received question:", question)

    // Log the exact request we're about to send
    const requestBody = { question }
    console.log("Sending request to API:", JSON.stringify(requestBody))

    try {
      // Make the API call with detailed logging
      console.log(`Sending request to: ${API_URL}`)

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      // Log the raw response
      const responseText = await response.text()
      console.log("Raw API response:", responseText)
      console.log("Response status:", response.status)

      if (!response.ok) {
        console.error(`API error: Status ${response.status}`)
        throw new Error(`API error: ${response.status}`)
      }

      // Try to parse the response as JSON
      try {
        const data = JSON.parse(responseText)
        console.log("Parsed API response:", JSON.stringify(data, null, 2))
        return NextResponse.json(data)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        // If it's not JSON, return the raw text
        return NextResponse.json({
          response: `The API returned a non-JSON response: ${responseText.substring(0, 100)}...`,
          apiStatus: "error",
        })
      }
    } catch (apiError) {
      console.error("API call failed:", apiError)

      // If the API call fails, use our fallback
      console.log("Using fallback response")
      return NextResponse.json({
        response: `I understand you're asking about: "${question}"

Unfortunately, I'm currently experiencing technical difficulties connecting to the Salesforce earnings call database. Our team is working to resolve this issue.

In the meantime, you can:

1. Try again later when the service is back online
2. Visit the official Salesforce Investor Relations website at [https://investor.salesforce.com/](https://investor.salesforce.com/) for the latest earnings information
3. Check the most recent earnings call transcript at [https://investor.salesforce.com/events-and-presentations/](https://investor.salesforce.com/events-and-presentations/)

For specific financial information, you can also check:
- [Salesforce Quarterly Results](https://investor.salesforce.com/financials/quarterly-results/)
- [Salesforce Annual Reports](https://investor.salesforce.com/financials/annual-reports/)

I apologize for the inconvenience and appreciate your patience.`,
        apiStatus: "offline",
        fallback: true,
      })
    }
  } catch (error) {
    console.error("Error in proxy route:", error)

    return NextResponse.json(
      {
        error: "The Salesforce Earnings Call service is temporarily unavailable.",
        response: `I'm sorry, but I'm currently unable to access the Salesforce earnings call database. The service might be undergoing maintenance or experiencing high traffic.

Please try again in a few minutes. In the meantime, you can:

1. Visit the official Salesforce Investor Relations website at [https://investor.salesforce.com/](https://investor.salesforce.com/)
2. Check the most recent earnings call transcript at [https://investor.salesforce.com/events-and-presentations/](https://investor.salesforce.com/events-and-presentations/)
3. Try a more specific question when the service is back online

Thank you for your patience!`,
        apiStatus: "error",
      },
      { status: 200 }, // Return 200 to the client even though there was an error
    )
  }
}
