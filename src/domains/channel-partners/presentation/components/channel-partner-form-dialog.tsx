import { useEffect } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Control } from "react-hook-form"
import { z } from "zod"

import { useProjectNames } from "@/domains/project/presentation/hooks/use-projects"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

import { useCreateChannelPartner, useUpdateChannelPartner } from "../hooks/use-channel-partners"

import type { ChannelPartnerDto } from "../../domain/types"

const PARTNER_TYPES = ["CHANNEL_PARTNER", "BROKER"] as const
const TIERS = ["SILVER", "GOLD", "PLATINUM"] as const
const ONBOARDING_STATUSES = ["DRAFT", "ACTIVE", "SUSPENDED"] as const
const PRIMARY_MARKETS = [
  "PRIMARY_NEW_PROJECTS",
  "SECONDARY_RESALE",
  "COMMERCIAL",
  "LUXURY",
  "AFFORDABLE"
] as const
const ACCOUNT_TYPES = ["CURRENT", "SAVINGS", "OVERDRAFT", "NRE", "NRO"] as const
const COMMISSION_TYPES = ["PERCENTAGE", "FLAT"] as const
const PAYOUT_TRIGGERS = ["ON_BOOKING", "ON_AGREEMENT", "ON_REGISTRATION", "ON_POSSESSION"] as const

const NONE = "__none__"

const partnerFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Firm name is required" }),
  email: z.email({ message: "Enter a valid email" }),
  partnerType: z.enum(PARTNER_TYPES).optional(),
  ownerPocName: z.string().trim().optional(),
  primaryCountryCode: z.string().trim().optional(),
  primaryPhone: z.string().trim().optional(),
  alternateEmail: z.union([z.literal(""), z.email({ message: "Enter a valid email" })]).optional(),
  reraRegNumber: z.string().trim().optional(),
  reraVerified: z.boolean(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  whatsappNo: z.string().trim().optional(),
  numberOfSalesAgents: z.string().optional(),
  yearsInBusiness: z.string().optional(),
  primaryMarket: z.enum(PRIMARY_MARKETS).optional(),
  gstNumber: z.string().trim().optional(),
  ownerPan: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  bankAccountNumber: z.string().trim().optional(),
  ifscCode: z.string().trim().optional(),
  accountType: z.enum(ACCOUNT_TYPES).optional(),
  tier: z.enum(TIERS).optional(),
  assignedProjects: z.array(z.string()).optional(),
  commissionType: z.enum(COMMISSION_TYPES).optional(),
  commissionRate: z.string().optional(),
  commissionPayoutTrigger: z.enum(PAYOUT_TRIGGERS).optional(),
  paymentTermsDays: z.string().optional(),
  onboardingStatus: z.enum(ONBOARDING_STATUSES).optional()
})

type PartnerFormValues = z.infer<typeof partnerFormSchema>

const defaults: PartnerFormValues = {
  name: "",
  email: "",
  partnerType: "CHANNEL_PARTNER",
  ownerPocName: "",
  primaryCountryCode: "+91",
  primaryPhone: "",
  alternateEmail: "",
  reraRegNumber: "",
  reraVerified: false,
  city: "",
  state: "",
  whatsappNo: "",
  numberOfSalesAgents: "",
  yearsInBusiness: "",
  primaryMarket: undefined,
  gstNumber: "",
  ownerPan: "",
  bankName: "",
  bankAccountNumber: "",
  ifscCode: "",
  accountType: undefined,
  tier: undefined,
  assignedProjects: [],
  commissionType: undefined,
  commissionRate: "",
  commissionPayoutTrigger: undefined,
  paymentTermsDays: "",
  onboardingStatus: "DRAFT"
}

interface ChannelPartnerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner?: ChannelPartnerDto | null
}

/**
 * Onboarding form, laid out as the reference wizard steps.
 *
 * Tabs rather than a stepper: the reference gates each step because a partner is onboarded over
 * days by different people, whereas here the whole record is editable at once and forcing a
 * sequence would only get in the way.
 */
export function ChannelPartnerFormDialog({ open, onOpenChange, partner }: ChannelPartnerFormDialogProps) {
  const isEdit = Boolean(partner?.id)

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: defaults
  })

  const { data: projects } = useProjectNames()
  const createPartner = useCreateChannelPartner()
  const updatePartner = useUpdateChannelPartner()
  const isSubmitting = createPartner.isPending || updatePartner.isPending

  useEffect(() => {
    if (!open) return

    if (partner) {
      form.reset({
        name: partner.name,
        email: partner.email,
        partnerType: partner.partnerType ?? "CHANNEL_PARTNER",
        ownerPocName: partner.ownerPocName ?? "",
        primaryCountryCode: partner.primaryCountryCode ?? "+91",
        primaryPhone: partner.primaryPhone ?? "",
        alternateEmail: partner.alternateEmail ?? "",
        reraRegNumber: partner.reraRegNumber ?? "",
        reraVerified: partner.reraVerified ?? false,
        city: partner.address?.city ?? "",
        state: partner.address?.state ?? "",
        whatsappNo: partner.whatsappNo ?? "",
        numberOfSalesAgents: partner.numberOfSalesAgents != null ? String(partner.numberOfSalesAgents) : "",
        yearsInBusiness: partner.yearsInBusiness != null ? String(partner.yearsInBusiness) : "",
        primaryMarket: partner.primaryMarket ?? undefined,
        gstNumber: partner.gstNumber ?? "",
        ownerPan: partner.ownerPan ?? "",
        bankName: partner.bankName ?? "",
        bankAccountNumber: partner.bankAccountNumber ?? "",
        ifscCode: partner.ifscCode ?? "",
        accountType: partner.accountType ?? undefined,
        tier: partner.tier ?? undefined,
        assignedProjects: partner.assignedProjects ?? [],
        commissionType: partner.commissionType ?? undefined,
        commissionRate: partner.commissionRate != null ? String(partner.commissionRate) : "",
        commissionPayoutTrigger: partner.commissionPayoutTrigger ?? undefined,
        paymentTermsDays: partner.paymentTermsDays != null ? String(partner.paymentTermsDays) : "",
        onboardingStatus: partner.onboardingStatus ?? "DRAFT"
      })
    } else {
      form.reset(defaults)
    }
  }, [open, partner, form])

  const onSubmit = async (values: PartnerFormValues) => {
    const request: ChannelPartnerDto = {
      name: values.name,
      email: values.email,
      partnerType: values.partnerType ?? null,
      ownerPocName: values.ownerPocName || null,
      primaryCountryCode: values.primaryCountryCode || null,
      primaryPhone: values.primaryPhone || null,
      alternateEmail: values.alternateEmail || null,
      reraRegNumber: values.reraRegNumber || null,
      reraVerified: values.reraVerified,
      address:
        values.city || values.state
          ? { city: values.city || null, state: values.state || null }
          : null,
      whatsappNo: values.whatsappNo || null,
      numberOfSalesAgents: values.numberOfSalesAgents ? Number(values.numberOfSalesAgents) : null,
      yearsInBusiness: values.yearsInBusiness ? Number(values.yearsInBusiness) : null,
      primaryMarket: values.primaryMarket ?? null,
      gstNumber: values.gstNumber || null,
      ownerPan: values.ownerPan || null,
      bankName: values.bankName || null,
      bankAccountNumber: values.bankAccountNumber || null,
      ifscCode: values.ifscCode || null,
      accountType: values.accountType ?? null,
      tier: values.tier ?? null,
      assignedProjects: values.assignedProjects ?? [],
      commissionType: values.commissionType ?? null,
      // Left null when blank so the server can fall back to the tier default rather than
      // recording an explicit zero.
      commissionRate: values.commissionRate ? Number(values.commissionRate) : null,
      commissionPayoutTrigger: values.commissionPayoutTrigger ?? null,
      paymentTermsDays: values.paymentTermsDays ? Number(values.paymentTermsDays) : null,
      onboardingStatus: values.onboardingStatus ?? "DRAFT"
    }

    try {
      if (partner?.id) {
        await updatePartner.mutateAsync({ id: partner.id, data: request })
      } else {
        await createPartner.mutateAsync(request)
      }
      onOpenChange(false)
    } catch {
      // Toasted centrally; a duplicate email keeps the dialog open on the entered values.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit channel partner" : "New channel partner"}</DialogTitle>
          <DialogDescription>
            Firm name and email are required. Everything else can be filled in later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="firm">
              <TabsList className="w-full">
                <TabsTrigger value="firm" className="flex-1">
                  Firm
                </TabsTrigger>
                <TabsTrigger value="kyc" className="flex-1">
                  KYC and banking
                </TabsTrigger>
                <TabsTrigger value="commission" className="flex-1">
                  Commission
                </TabsTrigger>
              </TabsList>

              <TabsContent value="firm" className="grid gap-4 pt-4 sm:grid-cols-2">
                <TextField control={form.control} name="name" label="Firm name" placeholder="Anand Realty" />
                <EnumField control={form.control} name="partnerType" label="Type" options={PARTNER_TYPES} />
                <TextField control={form.control} name="ownerPocName" label="Owner / POC" placeholder="Anand Rao" />
                <TextField control={form.control} name="email" label="Email" placeholder="anand@realty.com" />
                <TextField control={form.control} name="primaryPhone" label="Phone" placeholder="9876543210" />
                <TextField control={form.control} name="whatsappNo" label="WhatsApp" placeholder="9876543210" />
                <TextField control={form.control} name="alternateEmail" label="Alternate email" />
                <TextField control={form.control} name="reraRegNumber" label="RERA number" />
                <TextField control={form.control} name="city" label="City" placeholder="Hyderabad" />
                <TextField control={form.control} name="state" label="State" placeholder="Telangana" />
                <TextField
                  control={form.control}
                  name="numberOfSalesAgents"
                  label="Sales agents"
                  type="number"
                />
                <TextField control={form.control} name="yearsInBusiness" label="Years in business" type="number" />
                <EnumField
                  control={form.control}
                  name="primaryMarket"
                  label="Primary market"
                  options={PRIMARY_MARKETS}
                />
                <EnumField
                  control={form.control}
                  name="onboardingStatus"
                  label="Onboarding status"
                  options={ONBOARDING_STATUSES}
                />

                <FormField
                  control={form.control}
                  name="reraVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 sm:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={value => field.onChange(Boolean(value))}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">RERA registration verified</FormLabel>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="kyc" className="grid gap-4 pt-4 sm:grid-cols-2">
                <TextField control={form.control} name="ownerPan" label="Owner PAN" placeholder="ABCDE1234F" />
                <TextField control={form.control} name="gstNumber" label="GST number" />
                <TextField control={form.control} name="bankName" label="Bank" placeholder="HDFC Bank" />
                <TextField control={form.control} name="bankAccountNumber" label="Account number" />
                <TextField control={form.control} name="ifscCode" label="IFSC" placeholder="HDFC0001234" />
                <EnumField
                  control={form.control}
                  name="accountType"
                  label="Account type"
                  options={ACCOUNT_TYPES}
                />
              </TabsContent>

              <TabsContent value="commission" className="grid gap-4 pt-4 sm:grid-cols-2">
                <EnumField control={form.control} name="tier" label="Tier" options={TIERS} />
                <EnumField
                  control={form.control}
                  name="commissionType"
                  label="Commission type"
                  options={COMMISSION_TYPES}
                />
                <TextField
                  control={form.control}
                  name="commissionRate"
                  label="Commission rate"
                  type="number"
                  placeholder="Defaults to the tier rate"
                />
                <EnumField
                  control={form.control}
                  name="commissionPayoutTrigger"
                  label="Payout trigger"
                  options={PAYOUT_TRIGGERS}
                />
                <TextField
                  control={form.control}
                  name="paymentTermsDays"
                  label="Payment terms (days)"
                  type="number"
                />

                <FormField
                  control={form.control}
                  name="assignedProjects"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Authorised projects</FormLabel>
                      <div className="flex flex-wrap gap-3 rounded-md border p-3">
                        {!projects || projects.length === 0 ? (
                          <span className="text-muted-foreground text-sm">No projects yet.</span>
                        ) : (
                          projects.map(project => {
                            const selected = field.value?.includes(project.id) ?? false
                            return (
                              <label
                                key={project.id}
                                className="flex cursor-pointer items-center gap-1.5 text-sm"
                              >
                                <Checkbox
                                  checked={selected}
                                  onCheckedChange={checked => {
                                    const current = field.value ?? []
                                    field.onChange(
                                      checked
                                        ? [...current, project.id]
                                        : current.filter(id => id !== project.id)
                                    )
                                  }}
                                />
                                {project.name}
                              </label>
                            )
                          })
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create partner"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function TextField({
  control,
  name,
  label,
  placeholder,
  type
}: {
  control: Control<PartnerFormValues>
  name: keyof PartnerFormValues
  label: string
  placeholder?: string
  type?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              value={(field.value as string) ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function EnumField({
  control,
  name,
  label,
  options
}: {
  control: Control<PartnerFormValues>
  name: keyof PartnerFormValues
  label: string
  options: readonly string[]
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={(field.value as string) || NONE}
            onValueChange={value => field.onChange(value === NONE ? undefined : value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={NONE}>Not set</SelectItem>
              {options.map(option => (
                <SelectItem key={option} value={option}>
                  {option.replaceAll("_", " ").toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
