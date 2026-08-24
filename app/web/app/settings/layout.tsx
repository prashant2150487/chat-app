import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { HeaderProvider } from "@/components/header/header-context"

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <HeaderProvider>
      <div className="grid h-svh max-h-svh w-full grid-cols-[72px_1fr] overflow-hidden bg-background">
        <Sidebar />
        <div className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden">
          <Header />
          <main className="scroll-area min-h-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </HeaderProvider>
  )
}
