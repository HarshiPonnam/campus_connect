import { FormEvent, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "~/ui/Button"
import { Profile, useAuthContext, useGetMyProfile, useUpdateProfile } from "~/api/hooks"
import { TextField, TextAreaField } from "~/ui/TextField"
import { StandardErrorBox } from "~/ui/ErrorBox"
import { twMerge } from 'tailwind-merge'
import { Form } from "~/ui/Form"

export const Route = createFileRoute("/_authenticated/_layout/profile")({
  component: ProfilePage,
})

const borderClasses = "border border-2 shadow-md border-fuchsia-200 dark:border-stone-800 dark:bg-stone-800/50 bg-fuchsia-200/50 rounded-lg p-4"

/* ----------------------------- Types ----------------------------- */

type EditableFieldProps = {
  label: string
  value?: string
  isEditing: boolean
  multiline?: boolean
}

/* ----------------------------- Page ----------------------------- */

function ProfileFields({ profileData }: { profileData: Profile }) {
  const [major, setMajor] = useState(profileData.major)
  const [department, setDepartment] = useState(profileData.department)
  const [year, setYear] = useState(profileData.year)
  const [bio, setBio] = useState(profileData.bio)
  const updateProfile = useUpdateProfile()

  const dirty = major != profileData.major || department != profileData.department || year != profileData.year || bio != profileData.bio

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) {
      return
    }

    const result = await updateProfile.mutateAsync({
      major,
      department,
      year,
      bio,
    })

    setMajor(result.data.major)
    setDepartment(result.data.department)
    setYear(result.data.year)
    setBio(result.data.bio)
  };

  return (
    <div className={twMerge(borderClasses, "space-y-4")}>
      <Form onSubmit={handleSubmit}>
        <TextField label="Major" value={major} onChange={setMajor} placeholder="Unspecified" />
        <TextField label="Department" value={department} onChange={setDepartment} placeholder="Unspecified" />
        <TextField label="Year" value={year} onChange={setYear} placeholder="Unspecified" />
        <TextAreaField label="Bio" value={bio} onChange={setBio} placeholder="Write about yourself..." />

        <Button variant="secondary" type="submit" isPending={updateProfile.isPending} isDisabled={!dirty}>
          Save Profile
        </Button>

        <StandardErrorBox explanation="Failed to update profile" error={updateProfile.error} />
      </Form>
    </div>
  )
}

function ProfilePage() {
  const user = useAuthContext().user!.user
  const profile = useGetMyProfile()
  const profileData = profile.data?.data

  if (profile.isLoading) {
    return <p className="mt-8">Loading your profile…</p>;
  }

  if (profile.isError) {
    return <StandardErrorBox explanation="Failed to load profile" error={profile.error} />
  }

  if (profileData === undefined) {
    throw new Error("should be defined if it's not loading or errored")
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-fuchsia-500 text-white flex items-center justify-center text-2xl font-bold">
          {user.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm opacity-70">{user.email}</p>
        </div>
      </div>

      {/* Profile Fields */}
      <ProfileFields profileData={profileData} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Stat label="Posts" value={profileData.postsCount} />
        <Stat label="Likes Given" value={profileData.likesGivenCount} />
        <Stat label="Likes Received" value={profileData.likesReceivedCount} />
        <Stat label="Comments" value={profileData.commentsReceivedCount} />
      </div>

      {/* Actions */}

      <div className="flex items-center space-x-4">
        <Link to="/" className="text-sm underline">
          Settings
        </Link>
      </div>
    </div>
  )
}

/* ----------------------------- Components ----------------------------- */

function EditableField({
  label,
  value,
  isEditing,
  multiline,
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value ?? "")

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium opacity-70">{label}</div>

      {!isEditing ? (
        <div className="opacity-50">{value || "—"}</div>
      ) : multiline ? (
        <TextAreaField
          className="w-full"
          value={localValue}
          onChange={setLocalValue}
        />
      ) : (
        <TextField
          className="w-full"
          value={localValue}
          onChange={setLocalValue}
        />
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value?: number }) {
  if (value === undefined) return null
  return (
    <div className={borderClasses}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  )
}

