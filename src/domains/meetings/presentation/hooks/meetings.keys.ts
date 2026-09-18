export const meetingKeys = {
  all: ["meetings"] as const,
  byLead: (leadId: string) => [...meetingKeys.all, "lead", leadId] as const,
  upcoming: (scope: "me" | "team") => [...meetingKeys.all, "upcoming", scope] as const
}
