import Link from "next/link"
import { MessageSquare, ShieldCheck, Sparkles, Zap } from "lucide-react"

const highlights = [
  {
    icon: Zap,
    title: "Realtime by default",
    description: "Messages, presence, and typing indicators in milliseconds.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & private",
    description: "End-to-end encrypted channels with granular access control.",
  },
  {
    icon: Sparkles,
    title: "Built for teams",
    description: "Roles, permissions, and admin tools that scale with you.",
  },
]

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_50%_at_20%_10%,rgba(255,255,255,0.18),transparent_60%),radial-gradient(50%_50%_at_90%_90%,rgba(255,255,255,0.12),transparent_60%)]"
        />

        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
            <MessageSquare className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">ChatApp</span>
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Where teams talk, ship, and stay in sync.
          </h1>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Join thousands of teams using ChatApp to collaborate faster with
            secure, realtime messaging.
          </p>

          <ul className="mt-8 space-y-5">
            {highlights.map((h) => {
              const Icon = h.icon
              return (
                <li key={h.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/15">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium">{h.title}</div>
                    <div className="text-sm text-primary-foreground/60">
                      {h.description}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} ChatApp. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="scroll-area flex h-svh max-h-svh flex-col">
        <header className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">ChatApp</span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-sm">{children}</div>
        </main>

        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </footer>
      </div>
    </div>
  )
}
