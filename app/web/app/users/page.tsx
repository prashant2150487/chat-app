import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UsersTable } from "./user-table"
import { InviteAndAddUser } from "@/components/InviteAndAddUser"

export default function UsersPage() {

  
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage team members, roles, and permissions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <InviteAndAddUser/>
            </div>
            
          </div>

        </div>

        <div className="mt-6">
          <UsersTable />
        </div>
      </div>
    </div>
  )
}
