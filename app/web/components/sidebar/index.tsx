"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react"

import { cn, initials } from "@/lib/utils"
import { logout } from "@/redux/features/authSlice"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { clearAuthCookies } from "@/utils/cookies/client"
import { disconnectSocket } from "@/lib/socket"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type RailItem = {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

type AccountMenuItem = {
  id: string
  title: string
  description: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  danger?: boolean
}

const railItems: RailItem[] = [
  { id: "chats", label: "Chats", href: "/", icon: MessageSquare, badge: 4 },
  { id: "users", label: "Users", href: "/users", icon: UsersRound },
]

const accountMenuItems: AccountMenuItem[] = [
  {
    id: "profile",
    title: "Profile",
    description: "Name, photo, and about info",
    href: "/settings/profile",
    icon: UserRound,
  },
  {
    id: "account",
    title: "Account",
    description: "Email, phone, and security",
    href: "/settings/account",
    icon: WalletCards,
  },
  {
    id: "privacy",
    title: "Privacy",
    description: "Who can see your info",
    href: "/settings/privacy",
    icon: Shield,
  },
  {
    id: "chat",
    title: "Chat",
    description: "Wallpaper, media, and history",
    href: "/settings/chats",
    icon: MessageSquare,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Sounds and message alerts",
    href: "/settings/notifications",
    icon: Bell,
  },
]

export const Sidebar: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [accountOpen, setAccountOpen] = React.useState(false)
  const { user } = useAppSelector((state) => state.auth)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const handleMenuNavigate = (href: string) => {
    setAccountOpen(false)
    router.push(href)
  }

  const handleLogout = () => {
    disconnectSocket()
    clearAuthCookies()
    router.push("/login")
    dispatch(logout())
    setAccountOpen(false)

  }

  return (
    <aside className="flex h-svh max-h-svh flex-col items-center gap-2 overflow-hidden border-r bg-sidebar py-3">
      <nav className="flex w-full flex-1 flex-col items-center gap-1 px-2">
        {railItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "relative h-11 w-11 rounded-2xl",
                    active &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  onClick={() => router.push(item.href)}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-5" />
                  {item.badge ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className="flex w-full flex-col items-center gap-2 px-2 pb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl"
              aria-label="Settings"
              onClick={() => router.push("/settings/profile")}
            >
              <Settings className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>

        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Account menu"
            >
              <Avatar className="size-10 cursor-pointer ring-1 ring-border">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                ) : null}
                <AvatarFallback>
                  {initials(user?.displayName || user?.username || "U")}
                </AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="end"
            sideOffset={12}
            className="w-72 gap-1 p-2"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
            <Separator className="my-1" />
            <div className="flex flex-col gap-0.5">
              {accountMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Item
                    key={item.id}
                    size="sm"
                    variant="default"
                    className="cursor-pointer hover:bg-muted"
                    role="button"
                    tabIndex={0}
                    onClick={() => item.href && handleMenuNavigate(item.href)}
                    onKeyDown={(event) => {
                      if (
                        (event.key === "Enter" || event.key === " ") &&
                        item.href
                      ) {
                        event.preventDefault()
                        handleMenuNavigate(item.href)
                      }
                    }}
                  >
                    <ItemMedia variant="icon">
                      <Icon className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{item.title}</ItemTitle>
                      <ItemDescription>{item.description}</ItemDescription>
                    </ItemContent>
                  </Item>
                )
              })}
            </div>
            <Separator className="my-1" />
            <Item
              size="sm"
              variant="default"
              className="cursor-pointer text-destructive hover:bg-destructive/10"
              role="button"
              tabIndex={0}
              onClick={handleLogout}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  handleLogout()
                }
              }}
            >
              <ItemMedia variant="icon">
                <LogOut className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-destructive">Logout</ItemTitle>
                <ItemDescription>Sign out of this device</ItemDescription>
              </ItemContent>
            </Item>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  )
}
