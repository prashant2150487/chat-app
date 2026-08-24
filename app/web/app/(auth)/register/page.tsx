"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "@/components/auth/password-input"
import { AuthDivider, SocialAuth } from "@/components/auth/social-auth"
import { authService } from "@/services/api/auth.service"

type RegisterForm = {
  firstName: string
  lastName: string
  email: string
  mobile: string
  password: string
}

const empty: RegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  password: "",
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = React.useState<RegisterForm>(empty)
  const [agree, setAgree] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const set =
    (key: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const canSubmit =
    form.firstName.trim() !== "" &&
    form.email.trim() !== "" &&
    form.password.length >= 8 &&
    agree

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    try {
      await authService.register({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        mobile: form.mobile.trim() || undefined,
      })

      toast.success("Account created. Please verify your email.")
      router.push(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create account",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h2>
        <p className="text-sm text-muted-foreground">
          Start collaborating with your team in minutes.
        </p>
      </div>

      <SocialAuth />
      <AuthDivider label="or sign up with email" />

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="Jane"
              autoComplete="given-name"
              className="h-10"
              value={form.firstName}
              onChange={set("firstName")}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              autoComplete="family-name"
              className="h-10"
              value={form.lastName}
              onChange={set("lastName")}
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className="h-10"
            value={form.email}
            onChange={set("email")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="mobile">Mobile number</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="+1 555 000 1234"
            autoComplete="tel"
            className="h-10"
            value={form.mobile}
            onChange={set("mobile")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            className="h-10"
            value={form.password}
            onChange={set("password")}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox
            className="mt-0.5"
            checked={agree}
            onCheckedChange={(v) => setAgree(v === true)}
            disabled={loading}
          />
          <span>
            I agree to the{" "}
            <Link
              href="#"
              className="text-foreground underline underline-offset-4"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-foreground underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <Button type="submit" className="h-10" disabled={!canSubmit || loading}>
          <UserPlus className="size-4" />
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
