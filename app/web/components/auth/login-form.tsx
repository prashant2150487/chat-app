"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LogIn } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "@/components/auth/password-input"
import { AuthDivider, SocialAuth } from "@/components/auth/social-auth"
import { authService } from "@/services/api/auth.service"
import { userService } from "@/services/api/user.service"
import { useAppDispatch } from "@/redux/hooks"
import { setUser } from "@/redux/features/authSlice"
import { setAuthTokens } from "@/utils/cookies/client"
import { connectSocket } from "@/lib/socket"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const canSubmit = email.trim() !== "" && password.trim() !== ""

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    try {
      const data = await authService.login({ email: email.trim(), password })
      setAuthTokens(data.token, data.refreshToken)

      try {
        const profile = await userService.getMe()
        dispatch(setUser(profile))
      } catch {
        // Token is set; AuthHydrator will retry /users/me on the next page.
      }

      connectSocket()

      toast.success(data.message ?? "Signed in successfully")

      const redirect = searchParams.get("redirect") || "/"
      router.replace(redirect)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>

      <SocialAuth />
      <AuthDivider />

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox defaultChecked disabled={loading} />
          Remember me for 30 days
        </label>

        <Button type="submit" className="h-10" disabled={!canSubmit || loading}>
          <LogIn className="size-4" />
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>

  )
}
