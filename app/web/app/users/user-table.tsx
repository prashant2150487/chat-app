"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"

import { cn, initials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHeader } from "@/components/header/header-context"

import { users, type UserRole, type UserRow, type UserStatus } from "./data"

const PAGE_SIZE = 8

const STATUS_TABS: { value: "all" | Lowercase<UserStatus>; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
]

type SortKey = "name" | "role" | "department" | "status" | "lastActive"

type ColumnKey = "role" | "department" | "status" | "lastActive"

const TOGGLEABLE_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "role", label: "Role" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "lastActive", label: "Last Active" },
]

function roleBadge(role: UserRole) {
  switch (role) {
    case "Admin":
      return <Badge>Admin</Badge>
    case "Moderator":
      return (
        <Badge className="border-transparent bg-amber-400 text-amber-950">
          Moderator
        </Badge>
      )
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

function statusBadge(status: UserStatus) {
  switch (status) {
    case "Active":
      return (
        <Badge className="border-transparent bg-success text-success text-white">
          Active
        </Badge>
      )
    case "Suspended":
      return <Badge variant="destructive">Suspended</Badge>
    default:
      return <Badge variant="muted">Inactive</Badge>
  }
}

export function UsersTable() {
  const [tab, setTab] = React.useState<string>("all")
  const [query, setQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<SortKey>("name")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(1)
  const [hidden, setHidden] = React.useState<Record<ColumnKey, boolean>>({
    role: false,
    department: false,
    status: false,
    lastActive: false,
  })

  const { setHeader } = useHeader()
  React.useEffect(() => {
    setHeader({ title: "Users", subtitle: `${users.length} team members` })
  }, [setHeader])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => (tab === "all" ? true : u.status.toLowerCase() === tab))
      .filter((u) =>
        q
          ? u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
          : true,
      )
  }, [tab, query])

  const sorted = React.useMemo(() => {
    const rows = [...filtered]
    rows.sort((a, b) => {
      const av = a[sortKey].toLowerCase()
      const bv = b[sortKey].toLowerCase()
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return rows
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const pageRows = sorted.slice(start, start + PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [tab, query, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function sortIcon(key: SortKey) {
    if (key !== sortKey) {
      return <ChevronsUpDown className="size-3.5 text-muted-foreground/70" />
    }
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5" />
    ) : (
      <ArrowDown className="size-3.5" />
    )
  }

  function SortableHead({
    label,
    sortKey: key,
    className,
  }: {
    label: string
    sortKey: SortKey
    className?: string
  }) {
    return (
      <TableHead className={className}>
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-foreground/80"
        >
          {label}
          {sortIcon(key)}
        </button>
      </TableHead>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs px-3 py-2">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="pl-9 rounded-md"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-1.5 size-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TOGGLEABLE_COLUMNS.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={!hidden[col.key]}
                  onCheckedChange={(checked) =>
                    setHidden((prev) => ({ ...prev, [col.key]: !checked }))
                  }
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Download className="mr-1.5 size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHead label="Name" sortKey="name" className="px-4" />
              {!hidden.role ? (
                <SortableHead label="Role" sortKey="role" />
              ) : null}
              {!hidden.department ? (
                <SortableHead label="Department" sortKey="department" />
              ) : null}
              {!hidden.status ? (
                <SortableHead label="Status" sortKey="status" />
              ) : null}
              {!hidden.lastActive ? (
                <SortableHead label="Last Active" sortKey="lastActive" />
              ) : null}
              <TableHead className="w-20 px-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((u: UserRow) => (
                <TableRow key={u.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 ring-1 ring-border/60">
                        <AvatarFallback className="text-xs">
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {u.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {!hidden.role ? <TableCell>{roleBadge(u.role)}</TableCell> : null}
                  {!hidden.department ? (
                    <TableCell className="text-sm">{u.department}</TableCell>
                  ) : null}
                  {!hidden.status ? (
                    <TableCell>{statusBadge(u.status)}</TableCell>
                  ) : null}
                  {!hidden.lastActive ? (
                    <TableCell className="text-sm text-muted-foreground">
                      {u.lastActive}
                    </TableCell>
                  ) : null}
                  <TableCell className="px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        aria-label={`Edit ${u.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        aria-label={`Delete ${u.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: count + pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {sorted.length === 0
            ? "No users"
            : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length} users`}
        </p>

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={currentPage === 1}
                className={cn(
                  currentPage === 1 && "pointer-events-none opacity-50 ",
                )}
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.max(1, p - 1))
                }}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={currentPage === totalPages}
                className={cn(
                  currentPage === totalPages &&
                    "pointer-events-none opacity-50",
                )}
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.min(totalPages, p + 1))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
