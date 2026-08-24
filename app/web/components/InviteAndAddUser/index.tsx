"use client"

import React from "react"
import { Mail, Plus } from "lucide-react"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

const ROLES = ["Admin", "Editor", "Moderator", "Viewer"] as const
const STATUSES = ["Active", "Inactive", "Suspended"] as const

type AddUserForm = {
  name: string
  email: string
  role: string
  department: string
  status: string
}

type InviteForm = {
  email: string
  role: string
}

const emptyAddUser: AddUserForm = {
  name: "",
  email: "",
  role: "Viewer",
  department: "",
  status: "Active",
}

const emptyInvite: InviteForm = {
  email: "",
  role: "Viewer",
}

export const InviteAndAddUser = () => {
  const [isInviteUser, setIsInviteUser] = React.useState<boolean>(false)
  const [isAddUser, setIsAddUser] = React.useState<boolean>(false)
  const [addForm, setAddForm] = React.useState<AddUserForm>(emptyAddUser)
  const [inviteForm, setInviteForm] = React.useState<InviteForm>(emptyInvite)

  const canAdd = addForm.name.trim() !== "" && addForm.email.trim() !== ""
  const canInvite = inviteForm.email.trim() !== ""

  function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    if (!canAdd) return
    // UI-only for now. Hook your create-user API here later.
    setIsAddUser(false)
    setAddForm(emptyAddUser)
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!canInvite) return
    // UI-only for now. Hook your send-invite API here later.
    setIsInviteUser(false)
    setInviteForm(emptyInvite)
  }

  return (
    <React.Fragment>
      <div className="flex items-center gap-2">
        <Button onClick={() => setIsAddUser(true)}>
          <Plus className="size-4" />
          <span className="text-sm">Add User</span>
        </Button>
        <Button variant="outline" onClick={() => setIsInviteUser(true)}>
          <Mail className="size-4" />
          <span className="text-sm">Invite User</span>
        </Button>
      </div>

      {/* Add User */}
      <Dialog open={isAddUser} onOpenChange={setIsAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Create a new team member and assign their role.
            </DialogDescription>
          </DialogHeader>

          <form id="add-user-form" onSubmit={handleAddUser}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Full name</Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Jane Doe"
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="jane@company.com"
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select
                    value={addForm.role}
                    onValueChange={(v) =>
                      setAddForm((f) => ({ ...f, role: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={addForm.status}
                    onValueChange={(v) =>
                      setAddForm((f) => ({ ...f, status: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add-department">Department</Label>
                <Input
                  id="add-department"
                  value={addForm.department}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, department: e.target.value }))
                  }
                  placeholder="Engineering"
                  autoComplete="off"
                />
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddUser(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="add-user-form" disabled={!canAdd}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User */}
      <Dialog open={isInviteUser} onOpenChange={setIsInviteUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation by email. They&apos;ll set up their own
              account.
            </DialogDescription>
          </DialogHeader>

          <form id="invite-user-form" onSubmit={handleInvite}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="jane@company.com"
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(v) =>
                    setInviteForm((f) => ({ ...f, role: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteUser(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="invite-user-form"
              disabled={!canInvite}
            >
              <Mail className="size-4" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}
