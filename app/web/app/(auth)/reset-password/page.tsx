"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, LockKeyhole } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"

function scorePassword(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH = [
  { label: "Too weak", color: "bg-destructive" },
  { label: "Weak", color: "bg-destructive" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-amber-400" },
  { label: "Strong", color: "bg-success" },
]

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const score = scorePassword(password)
  const mismatch = confirm.length > 0 && confirm !== password
  const canSubmit =
    password.length >= 8 && confirm === password && !mismatch

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    // UI-only for now. Hook your reset-password API here later.
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setDone(true)
    }, 900)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Password reset
          </h2>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. You can now sign in.
          </p>
        </div>
        <Button asChild className="h-10 w-full">
          <Link href="/login">Continue to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LockKeyhole className="size-6" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Set a new password
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            placeholder="Enter new password"
            autoComplete="new-password"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 ? (
            <div className="mt-1 flex flex-col gap-1.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < score ? STRENGTH[score].color : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {STRENGTH[score].label}
              </span>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput
            id="confirm"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            className="h-10"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
          />
          {mismatch ? (
            <p className="text-xs text-destructive">Passwords do not match.</p>
          ) : null}
        </div>

        <Button type="submit" className="h-10" disabled={!canSubmit || loading}>
          {loading ? "Updating…" : "Reset password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
