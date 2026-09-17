import { z } from "zod"

/**
 * Form contract for the lead dialog.
 *
 * Deliberately the same shape and the same required fields as the backend CreateLeadRequest, so a
 * form that validates here is not rejected there for a different reason. Optional text fields
 * accept an empty string and are stripped on submit, because an empty input is how a user clears
 * a field and the API expects null rather than "".
 */
export const leadFormSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().optional(),
  mobile: z
    .string()
    .trim()
    .min(1, { message: "Mobile is required" })
    // Loose on purpose: the backend normalises with libphonenumber and owns the real rule. A
    // stricter pattern here would reject valid international numbers before they were sent.
    .regex(/^[+0-9\s-]{6,20}$/, { message: "Enter a valid mobile number" }),
  countryCode: z.string().trim().optional(),
  alternateMobile: z.string().trim().optional(),
  email: z.union([z.literal(""), z.email({ message: "Enter a valid email" })]).optional(),
  occupation: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  propertyCategory: z.enum(["RESIDENTIAL", "COMMERCIAL", "PLOT", "AGRICULTURE"], {
    message: "Property category is required"
  }),
  purchaseTimeline: z
    .enum(["IMMEDIATE", "ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS", "ONE_YEAR", "EXPLORING"])
    .optional(),
  projectId: z.string().optional(),
  channelPartnerId: z.string().optional(),
  statusId: z.string().optional(),
  temperatureId: z.string().optional(),
  sourceCategoryId: z.string().optional(),
  sourceTypeId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  assignedToUserName: z.string().trim().optional(),
  scheduleDate: z.string().optional(),
  notes: z.string().trim().optional(),
  isNri: z.boolean(),
  isDraft: z.boolean()
})

export type LeadFormValues = z.infer<typeof leadFormSchema>

export const leadFormDefaults: LeadFormValues = {
  firstName: "",
  lastName: "",
  mobile: "",
  countryCode: "+91",
  alternateMobile: "",
  email: "",
  occupation: "",
  city: "",
  state: "",
  propertyCategory: "RESIDENTIAL",
  purchaseTimeline: undefined,
  projectId: undefined,
  channelPartnerId: undefined,
  statusId: undefined,
  temperatureId: undefined,
  sourceCategoryId: undefined,
  sourceTypeId: undefined,
  tagIds: [],
  assignedToUserName: "",
  scheduleDate: "",
  notes: "",
  isNri: false,
  isDraft: false
}
