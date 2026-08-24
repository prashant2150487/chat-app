import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfileSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your name, about info, and privacy preferences.
        </p>
      </div>
      <ProfileForm />
    </div>
  )
}
