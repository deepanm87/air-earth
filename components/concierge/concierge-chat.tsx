"use client"

import { useChat } from "@ai-sdk/react"
import { useAuth } from "@clerk/nextjs"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses
} from "ai"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { CONCIERGE_SUGGESTIONS } from "./concierge-prompts"
import { ConciergeEmptyState } from "./concierge-empty-state"
import { ConciergeSignedOutState } from "./concierge-signed-out-state"
import {
  ConciergeMessage,
  hasVisibleConciergeContent
} from "./concierge-result"
import { ArrowIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

export function ConciergeChat() {
  const { isLoaded, isSignedIn, has } = useAuth()
  const [input, setInput] = useState("")
  const [quickReplyLocked, setQuickReplyLocked] = useState(false)
  const quickReplyLockRef = useRef(false)
  const messagesRef = useRef(false)
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/concierge" }),
    []
  )
  const { messages, sendMessage, status, error, addToolApprovalResponse } = 
    useChat({
      transport,
      sendAutomaticallyWhen:
        lastAssistantMessageIsCompleteWithApprovalResponses
    })
  const canUseConcierge = Boolean(has?.({ feature: "ai_concierge "}))
  const busy = status === "submitted" || status === "streaming"
  const latestMessage = messages.at(-1)
  const latestAssistantMessageId = [...messages]
    .reverse()
    .find(message => message.role === "assistant")?.id
  const waitingForAssistantContent = 
    status === "streaming" &&
    (latestMessage?.role !== "assistant" ||
      !hasVisibleConciergeContent(latestMessage))
  const showThinking = status === "submitted" || waitingForAssistantContent

  useEffect(() => {
    if (messages.length === 0) {
      return
    }
    const container = messagesRef.current
    if (!container) {
      return
    }
    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      container.scrollTo({
        top: container.scrollHeight,
        behavior: reduceMotion || status === "streaming" ? "auto" : "smooth"
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [messages, status])

  function submit(text: string): boolean {
    const trimmed = text.trim()
    if (!trimmed || busy || !canUseConcierge) {
      return false
    }
    void sendMessage({ text: trimmed })
    setInput("")
    return true
  }

  function submitQuickReply(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy || !canUseConcierge || quickReplyLockRef.current) {
      return
    }
    quickReplyLockRef.current = true
    setQuickReplyLocked(true)
    setInput("")
    const releaseLock = () => {
      quickReplyLockRef.current = false
      setQuickReplyLocked(false)
    }
    void sendMessage({ text: trimmed }).then(releaseLock, releaseLock)
  }

  return(
    <section
      className={`concierge-chat concierge-chat-light ${isLoaded && !isSignedIn ? "concierge-chat-signed-out" : ""}`}
      aria-label="Flight concierge conversation"
    >
      {!isLoaded ? (
        <div className="agent-loading concierge-chat-state" role="status">
          Checking your access...
        </div>
      ) : !isSignedIn ? (
        <ConciergeSignedOutState />
      ) : !canUseConcierge ? (
        <div className="concierge-gate concierge-chat-gate concierge-chat-gate-pro">
          <div>
            <strong>Concierge is included with Pro.</strong>
            <p>Plan trips and save 20% on paid seat selection.</p>
          </div>
          <Button asChild size="sm">
            <Link href="/pro">
              View Pro <ArrowIcon />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div
            ref={messagesRef}
            className="agent-conversation concierge-chat-messages"
            aria-live={messages.length > 0 ? "polite" : "off"}
          >
            {messages.length === 0 ? (
              <ConciergeEmptyState />
            ) : (
              messages.map(message => (
                <ConciergeMessage 
                  key={message.id}
                  message={message}
                  onApproval={(id, approved) => 
                    void addToolApprovalResponse({ id, approved })
                  }
                  onQuickReply={submitQuickReply}
                  quickRepliesDisabled={
                    busy ||
                    quickReplyLocked ||
                    latestMessage?.role !== "assistant" ||
                    message.id !== latestAssistantMessageId
                  }
                  showFallbackQuickReplies={
                    message.id === latestAssistantMessageId
                  }
                />
              ))
            )}
            {showThinking && (
              <div
                className="agent-status-row agent-status-row-pending concierge-chat-thinking"
                role="status"
              >
                <span className="trace-dot" />
                <span className="agent-status-copy">Checking options...</span>
              </div>
            )}
            {error && (
              <div className="agent-error">
                {error.message.includes("403")
                  ? "Your Pro access has not refreshed yet. Try again in a moment."
                  : error.message
                }
              </div>
            )}
          </div>
          {messages.length === 0 && (
            <div
              className="agent-suggestions concierge-chat-suggestions"
              aria-label="Suggested concierge questions"
            >
              {CONCIERGE_SUGGESTIONS.map(suggestion => (
                <button
                  type="button"
                  key={suggestion.prompt}
                  aria-label={`Ask: ${suggestion.prompt}`}
                  onClick={() => submit(suggestion.prompt)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}
          <form
            className="agent-composer concierge-chat-composer"
            onSubmit={event => {
              event.preventDefault()
              submit(input)
            }}
          >
            <label className="sr-only" htmlFor="concierge-prompt">
              Message the concierge
            </label>
            <textarea 
              id="concierge-prompt"
              rows={2}
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  submit(input)
                }
              }}
              placeholder="Ask about flights, refunds, baggage, or seats"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <ArrowIcon />
            </button>
          </form>
        </>
      )}
    </section>
  )
}