export type UserRole = "Admin" | "Editor" | "Moderator" | "Viewer"
export type UserStatus = "Active" | "Inactive" | "Suspended"

export type UserRow = {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  status: UserStatus
  lastActive: string
}

export const users: UserRow[] = [
  { id: "u1", name: "Aigars Silkalns", email: "aigars@company.com", role: "Admin", department: "Engineering", status: "Active", lastActive: "2 hours ago" },
  { id: "u2", name: "Emma Wilson", email: "emma@company.com", role: "Editor", department: "Marketing", status: "Active", lastActive: "5 min ago" },
  { id: "u3", name: "James Chen", email: "james@company.com", role: "Admin", department: "Engineering", status: "Active", lastActive: "1 hour ago" },
  { id: "u4", name: "Sofia Garcia", email: "sofia@company.com", role: "Moderator", department: "Support", status: "Active", lastActive: "30 min ago" },
  { id: "u5", name: "Alex Thompson", email: "alex@company.com", role: "Viewer", department: "Sales", status: "Active", lastActive: "3 hours ago" },
  { id: "u6", name: "Maria Santos", email: "maria@company.com", role: "Editor", department: "Design", status: "Active", lastActive: "1 day ago" },
  { id: "u7", name: "David Kim", email: "david@company.com", role: "Viewer", department: "Finance", status: "Inactive", lastActive: "2 weeks ago" },
  { id: "u8", name: "Lisa Park", email: "lisa@company.com", role: "Editor", department: "Marketing", status: "Active", lastActive: "10 min ago" },
  { id: "u9", name: "Ryan Mitchell", email: "ryan@company.com", role: "Moderator", department: "Support", status: "Active", lastActive: "45 min ago" },
  { id: "u10", name: "Olivia Brown", email: "olivia@company.com", role: "Viewer", department: "Sales", status: "Suspended", lastActive: "1 month ago" },
  { id: "u11", name: "Noah Davis", email: "noah@company.com", role: "Editor", department: "Engineering", status: "Active", lastActive: "20 min ago" },
  { id: "u12", name: "Sophia Martinez", email: "sophia@company.com", role: "Admin", department: "Operations", status: "Active", lastActive: "4 hours ago" },
  { id: "u13", name: "Liam Johnson", email: "liam@company.com", role: "Viewer", department: "Finance", status: "Inactive", lastActive: "3 weeks ago" },
  { id: "u14", name: "Ava Anderson", email: "ava@company.com", role: "Moderator", department: "Support", status: "Active", lastActive: "1 hour ago" },
  { id: "u15", name: "Ethan Taylor", email: "ethan@company.com", role: "Editor", department: "Design", status: "Active", lastActive: "8 min ago" },
  { id: "u16", name: "Isabella Thomas", email: "isabella@company.com", role: "Viewer", department: "Marketing", status: "Suspended", lastActive: "2 months ago" },
  { id: "u17", name: "Mason White", email: "mason@company.com", role: "Editor", department: "Sales", status: "Active", lastActive: "55 min ago" },
  { id: "u18", name: "Mia Harris", email: "mia@company.com", role: "Admin", department: "Engineering", status: "Active", lastActive: "6 hours ago" },
  { id: "u19", name: "Lucas Martin", email: "lucas@company.com", role: "Viewer", department: "Finance", status: "Inactive", lastActive: "5 weeks ago" },
  { id: "u20", name: "Charlotte Lee", email: "charlotte@company.com", role: "Moderator", department: "Operations", status: "Active", lastActive: "12 min ago" },
]
