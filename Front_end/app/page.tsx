"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2, AlertCircle, WifiOff, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ReactMarkdown from "react-markdown"
import { useMediaQuery } from "@/hooks/use-media-query"

type Image = {
  caption: string
  base64: string
}

type MessageContent = {
  markdown: string
  images?: Image[]
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: MessageContent | string
}

export default function SalesforceEarningsAssistant() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: {
        markdown: `👋 **Welcome to the Salesforce Earnings Call Assistant**

I'm here to help you prepare for Salesforce earnings calls and analyze financial data. I can provide information about:

- Historical earnings call transcripts
- Financial metrics and KPIs
- Quarterly and annual performance
- Executive statements and guidance
- Analyst questions and company responses

---

💡 **You can ask questions like:**

- "What were the key highlights from Salesforce's Q4 2023 earnings call?"
- "How did Salesforce perform against revenue expectations last quarter?"
- "What did Marc Benioff say about AI initiatives in the recent earnings call?"
- "What questions did analysts ask about operating margins?"
- "How has Salesforce's guidance changed over the past year?"

---

📊 **Financial Resources:**

- [Salesforce Investor Relations](https://investor.salesforce.com/)
- [Quarterly Results](https://investor.salesforce.com/financials/quarterly-results/)
- [Annual Reports](https://investor.salesforce.com/financials/annual-reports/)

![Salesforce Logo](https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg)

---

🤖 _What would you like to know about Salesforce earnings?_`,
        images: [],
      },
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serviceStatus, setServiceStatus] = useState<"online" | "offline" | "maintenance">("online")
  const [debugMode, setDebugMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim() || isLoading) return

    // Reset any previous errors
    setError(null)

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const currentQuery = query
    setQuery("")

    try {
      // If in debug mode, use the debug endpoint
      const endpoint = debugMode ? "/api/debug" : "/api/proxy"

      // Use our proxy API route instead of directly calling the API endpoint
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuery }),
      })

      const data = await response.json()
      console.log("Frontend received:", JSON.stringify(data, null, 2))

      // If we're in debug mode, show the debug information
      if (debugMode) {
        const debugMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: {
            markdown: `### Debug Information

**API Status:** ${data.status}
**Status Text:** ${data.statusText}

**Headers:**
\`\`\`json
${JSON.stringify(data.headers, null, 2)}
\`\`\`

**Response Body:**
\`\`\`
${data.body}
\`\`\`

**Curl Command:**
\`\`\`bash
${data.curl}
\`\`\``,
            images: [],
          },
        }

        setMessages((prev) => [...prev, debugMessage])
        setServiceStatus(data.status >= 200 && data.status < 300 ? "online" : "offline")
        return
      }

      // Check API status from response
      if (data.apiStatus === "offline" || data.apiStatus === "error" || data.fallback) {
        setServiceStatus("maintenance")
      } else {
        setServiceStatus("online")
      }

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: {
          markdown: data.response || "No response returned.",
          images: data.images || [],
        },
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error fetching response:", error)

      // Set a more detailed error message
      const errorMessageText = error instanceof Error ? `Error: ${error.message}` : "Failed to fetch response"

      setError(errorMessageText)
      setServiceStatus("offline")

      // Handle error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: {
          markdown: `Sorry, I encountered an error while processing your request. The Salesforce Earnings Call service might be temporarily unavailable. Please try again in a few minutes.`,
          images: [],
        },
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render message content
  const renderMessageContent = (content: MessageContent | string) => {
    if (typeof content === "string") {
      return <div className="whitespace-pre-wrap break-words">{content}</div>
    }

    return (
      <div>
        <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
          <ReactMarkdown>{content.markdown}</ReactMarkdown>
        </div>

        {content.images && content.images.length > 0 && (
          <div className="grid gap-4 mt-4">
            {content.images.map((img, idx) => (
              <div key={idx}>
                <p className="text-xs sm:text-sm mb-1 font-medium">{img.caption}</p>
                <img
                  src={img.base64 || "/placeholder.svg"}
                  alt={`Image ${idx}`}
                  className="rounded shadow max-w-full h-auto"
                  onError={(e) => {
                    console.error("Image failed to load:", img.caption)
                    e.currentTarget.src = "/placeholder.svg?height=300&width=400"
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-2 sm:py-8 px-2 sm:px-4 max-w-full sm:max-w-4xl h-[100dvh] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden border-blue-200 dark:border-blue-900">
        <CardHeader className="p-3 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div>
                <CardTitle className="text-lg sm:text-xl text-blue-700 dark:text-blue-300">
                  Salesforce Earnings Call Assistant
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Ask questions about earnings calls and financial data
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDebugMode(!debugMode)}
                title={debugMode ? "Disable Debug Mode" : "Enable Debug Mode"}
              >
                <Bug className={`h-4 w-4 ${debugMode ? "text-red-500" : "text-gray-400"}`} />
                <span className="sr-only">{debugMode ? "Disable" : "Enable"} Debug Mode</span>
              </Button>
            </div>
            {serviceStatus !== "online" && (
              <div className="flex items-center text-amber-500 dark:text-amber-400 text-xs sm:text-sm">
                <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>
                  {serviceStatus === "maintenance" ? "Service under maintenance" : "Service temporarily unavailable"}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col p-2 sm:p-6">
          {error && (
            <Alert variant="destructive" className="mb-3 text-xs sm:text-sm p-2 sm:p-4">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <ScrollArea className="flex-1 pr-1 sm:pr-2">
            <div className="space-y-3 sm:space-y-4 pr-1 sm:pr-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar
                      className={`h-6 w-6 sm:h-8 sm:w-8 ${
                        message.role === "assistant" ? "bg-blue-100 dark:bg-blue-900" : "bg-blue-600 dark:bg-blue-700"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <>
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="AI" />
                          <AvatarFallback>
                            <Bot size={isMobile ? 14 : 18} className="text-blue-600 dark:text-blue-300" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                          <AvatarFallback>
                            <User size={isMobile ? 14 : 18} className="text-white" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>

                    <div
                      className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base ${
                        message.role === "assistant"
                          ? "bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900"
                          : "bg-blue-600 text-white dark:bg-blue-700"
                      }`}
                    >
                      {renderMessageContent(message.content)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%]">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-100 dark:bg-blue-900">
                      <AvatarFallback>
                        <Bot size={isMobile ? 14 : 18} className="text-blue-600 dark:text-blue-300" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="rounded-lg px-3 py-2 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 flex items-center">
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-blue-600 dark:text-blue-400" />
                      <span className="ml-2 text-xs sm:text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              placeholder="Ask about Salesforce earnings calls..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 text-sm sm:text-base h-9 sm:h-10 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-950"
            />
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              size={isMobile ? "sm" : "default"}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
