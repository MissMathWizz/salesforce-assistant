import { NextResponse } from "next/server"

// This is a debug endpoint to help us understand what's happening with the API
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()
    console.log("Debug endpoint received:", JSON.stringify(body))

    // Extract the question
    const { question } = body

    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 })
    }

    // Log the curl command that would make this request
    console.log(`
    To test with curl, run:
    
    curl -X POST \\
      -H "Content-Type: application/json" \\
      -d '{"question":"${question.replace(/"/g, '\\"')}"}' \\
      https://gemini-api-519156211042.us-central1.run.app/ask
    `)

    // Try to make the request ourselves
    try {
      const response = await fetch("https://gemini-api-519156211042.us-central1.run.app/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      // Get the response as text
      const responseText = await response.text()

      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        curl: `curl -X POST -H "Content-Type: application/json" -d '{"question":"${question.replace(/"/g, '\\"')}"}' https://gemini-api-519156211042.us-central1.run.app/ask`,
      })
    } catch (error) {
      return NextResponse.json(
        {
          error: "Failed to make API request",
          message: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to parse request",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    )
  }
}
