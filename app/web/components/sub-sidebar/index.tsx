"use client"

import * as React from "react"
import { Search, Plus } from "lucide-react"

import { cn, initials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { contact } from "@/types/api.types"
import { contactService } from "../../services/api/contactServices"
import { toast } from "sonner"

type SubSidebarProps = {
  title?: string
  subtitle?: string
  conversations: contact[]
  activeContactId: string | null
  onSelectContact: (contactUserId: string, name: string) => void
  query: string
  onQueryChange: (value: string) => void
}

export const SubSidebar: React.FC<SubSidebarProps> = ({
  title = "Chats",
  subtitle = "Your recent conversations",
  conversations,
  activeContactId,
  onSelectContact,
  query,
  onQueryChange,
}) => {
  console.log("conversations", conversations)

  const [isAddContactOpen, setIsAddContactOpen] = React.useState(false)
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber) return

    setIsSubmitting(true)
    try {
      await contactService.addContactByPhone(phoneNumber)
      toast.success("Contact added successfully")
      setIsAddContactOpen(false)
      setPhoneNumber("")
    } catch (error: any) {
      toast.error(error.message || "Failed to add contact")
      console.error("Error adding contact:", error);
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden border-r bg-background">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {subtitle}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="muted">
            {conversations.length}
          </Badge>
          <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
            <DialogTrigger asChild>
              <button
                className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title="Add contact"
              >
                <Plus className="size-4" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddContact}>
                <DialogHeader>
                  <DialogTitle>Add Contact</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Mobile Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddContactOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="shrink-0 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-9"
            placeholder="Search chats…"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 overflow-hidden px-2 pb-2">
        <div className="flex flex-col gap-1">
          {conversations.map((c) => {
            const active = activeContactId === c.contactId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectContact(c.contactId, c.contact.displayName)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                  "hover:bg-muted/60",
                  active && "bg-muted",
                )}
              >
                <Avatar className="mt-0.5 size-9 ring-1 ring-border/60">
                  <AvatarFallback>{initials(c.contact.displayName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium">
                      {c.contact.displayName}
                    </div>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.contact.phone || "No phone"}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </section>
  )
}
