"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ children, className }) {
  return (
    <nav aria-label="breadcrumb" className={cn("w-full", className)}>
      {children}
    </nav>
  )
}

export function BreadcrumbList({ children, className }) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-1 text-sm text-gray-600", className)}>
      {children}
    </ol>
  )
}

export function BreadcrumbItem({ children, className }) {
  return (
    <li className={cn("flex items-center gap-1", className)}>
      {children}
    </li>
  )
}

export function BreadcrumbLink({ children, href, className }) {
  return (
    <a href={href} className={cn("hover:text-blue-600 transition-colors", className)}>
      {children}
    </a>
  )
}

export function BreadcrumbPage({ children, className }) {
  return (
    <span className={cn("font-medium text-gray-900", className)}>
      {children}
    </span>
  )
}

export function BreadcrumbSeparator({ className }) {
  return (
    <ChevronRight className={cn("w-4 h-4 text-gray-400", className)} />
  )
}
