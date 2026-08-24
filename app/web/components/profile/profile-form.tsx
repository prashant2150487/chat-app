"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { userService } from "@/services/api/user.service"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setUser } from "@/redux/features/authSlice"
import { useHeader } from "@/components/header/header-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn, initials } from "@/lib/utils"
import type { PrivacySetting, UserPrivacy, UserProfile } from "@/types/api.types"

const DEFAULT_PRIVACY: UserPrivacy = {
  last_seen: "contacts",
  profile_photo: "everyone",
}

const privacyOptions: { value: PrivacySetting; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "contacts", label: "My contacts" },
  { value: "nobody", label: "Nobody" },
]

type ProfileFormState = {
  displayName: string
  username: string
  bio: string
  statusMsg: string
  phone: string
  avatarUrl: string
  privacy: UserPrivacy
}

const EMPTY_FORM: ProfileFormState = {
  displayName: "",
  username: "",
  bio: "",
  statusMsg: "",
  phone: "",
  avatarUrl: "",
  privacy: DEFAULT_PRIVACY,
}

function normalizePrivacy(value: unknown): UserPrivacy {
  if (
    typeof value === "object" &&
    value !== null &&
    "last_seen" in value &&
    "profile_photo" in value
  ) {
    const privacy = value as UserPrivacy
    return {
      last_seen: privacy.last_seen ?? DEFAULT_PRIVACY.last_seen,
      profile_photo: privacy.profile_photo ?? DEFAULT_PRIVACY.profile_photo,
    }
  }
  return DEFAULT_PRIVACY
}

function profileToFormState(profile: UserProfile): ProfileFormState {
  return {
    displayName: profile.displayName,
    username: profile.username,
    bio: profile.bio ?? "",
    statusMsg: profile.statusMsg ?? "",
    phone: profile.phone ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    privacy: normalizePrivacy(profile.privacy),
  }
}

export function ProfileForm() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { setHeader } = useHeader()

  const [form, setForm] = React.useState<ProfileFormState>(() =>
    user ? profileToFormState(user) : EMPTY_FORM,
  )
  const [loading, setLoading] = React.useState(!user)
  const [saving, setSaving] = React.useState(false)

  const updateForm = React.useCallback((patch: Partial<ProfileFormState>) => {
    setForm((current) => ({ ...current, ...patch }))
  }, [])

  React.useEffect(() => {
    setHeader({ title: "Profile", subtitle: "Manage your public info" })
  }, [setHeader])

  React.useEffect(() => {
    let active = true

    async function loadProfile() {
      if (user) {
        setForm(profileToFormState(user))
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const profile = await userService.getMe()
        if (!active) return
        dispatch(setUser(profile))
        setForm(profileToFormState(profile))
      } catch (error) {
        if (active) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load profile",
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [dispatch, user])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (saving || !form.displayName.trim()) return

    setSaving(true)
    try {
      const updated = await userService.updateMe({
        displayName: form.displayName.trim(),
        bio: form.bio.trim() || null,
        statusMsg: form.statusMsg.trim() || null,
        phone: form.phone.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        privacy: form.privacy,
      })
      dispatch(setUser(updated))
      setForm(profileToFormState(updated))
      toast.success("Profile updated")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Photo & identity</CardTitle>
          <CardDescription>
            How you appear to others in chats and search.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-1 ring-border">
              {form.avatarUrl ? (
                <AvatarImage src={form.avatarUrl} alt={form.displayName} />
              ) : null}
              <AvatarFallback className="text-lg">
                {initials(form.displayName || form.username)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{form.displayName}</p>
              <p>@{form.username}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={form.displayName}
              onChange={(e) => updateForm({ displayName: e.target.value })}
              placeholder="Your name"
              maxLength={100}
              required
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username}
              readOnly
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Username cannot be changed here.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={form.avatarUrl}
              onChange={(e) => updateForm({ avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Bio and status shown on your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={form.bio}
              onChange={(e) => updateForm({ bio: e.target.value })}
              placeholder="Tell people a little about yourself"
              rows={4}
              disabled={saving}
              className={cn(
                "border-input bg-background ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:ring-ring flex min-h-[96px] w-full rounded-md border px-3 py-2 text-sm",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="statusMsg">Status message</Label>
            <Input
              id="statusMsg"
              value={form.statusMsg}
              onChange={(e) => updateForm({ statusMsg: e.target.value })}
              placeholder="Available, busy, at work..."
              maxLength={200}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateForm({ phone: e.target.value })}
              placeholder="+1 555 000 0000"
              maxLength={20}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Control who can see your last seen and profile photo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label>Last seen</Label>
            <Select
              value={form.privacy.last_seen}
              onValueChange={(value: PrivacySetting) =>
                updateForm({
                  privacy: { ...form.privacy, last_seen: value },
                })
              }
              disabled={saving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose visibility" />
              </SelectTrigger>
              <SelectContent>
                {privacyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Profile photo</Label>
            <Select
              value={form.privacy.profile_photo}
              onValueChange={(value: PrivacySetting) =>
                updateForm({
                  privacy: { ...form.privacy, profile_photo: value },
                })
              }
              disabled={saving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose visibility" />
              </SelectTrigger>
              <SelectContent>
                {privacyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button type="submit" disabled={saving || !form.displayName.trim()}>
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  )
}
