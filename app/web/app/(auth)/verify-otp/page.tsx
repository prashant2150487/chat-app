"use client"

import * as React from "react"
import Link from "next/link"
import { MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export default function VerifyOtpPage() {
  const [otp, setOtp] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [seconds, setSeconds] = React.useState(30)

  React.useEffect(() => {
    if (seconds <= 0) return
    const t = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [seconds])

  const canSubmit = otp.length === 6

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    // UI-only for now. Hook your verify-otp API here later.
    setLoading(true)
    setTimeout(() => setLoading(false), 900)
  }

  function resend() {
    if (seconds > 0) return
    // UI-only for now. Hook your resend-otp API here later.
    setSeconds(30)
    setOtp("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Verify your email
        </h2>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to your email. Enter it below to continue.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-11 text-base" />
              <InputOTPSlot index={1} className="size-11 text-base" />
              <InputOTPSlot index={2} className="size-11 text-base" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="size-11 text-base" />
              <InputOTPSlot index={4} className="size-11 text-base" />
              <InputOTPSlot index={5} className="size-11 text-base" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button type="submit" className="h-10" disabled={!canSubmit || loading}>
          {loading ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        {seconds > 0 ? (
          <span>Resend in {seconds}s</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Resend code
          </button>
        )}
      </div>

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
