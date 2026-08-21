import type { UIMessage } from "ai"
import { useId } from "react"
import ReactMarkdown from "react-markdown"

import { ArrowIcon, CheckIcon, SparkIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

type ApproveHandler = (id: string, approved: boolean) => void
type QuickReplyHandler = (message: string) => void
type ConciergePart = UIMessage["parts"][number]

type QuickReplyOption = {
  label: string
  value: string
}

type QuickReplySet = {
  question?: string
  options: QuickReplyOption[]
}

