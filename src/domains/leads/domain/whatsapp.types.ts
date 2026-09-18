/**
 * Shape of the Engageto get-waMessage response.
 *
 * `status` is Engageto's own delivery-status enum, not documented beyond the payload itself. 6
 * shows up on every message that reads as an inbound reply from the contact, and 2/3/5 on
 * business-sent messages, so it doubles as the inbound/outbound signal until Engageto documents it
 * properly.
 */
export interface WhatsAppMessageDto {
  id: string
  status: number
  templateName: string | null
  textMessage: string | null
  mediaCaption: string | null
  mediaFileName: string | null
  mediaMimeType: string | null
  mediaUrl: string | null
  templateMediaType: string | null
  buttons: string[]
  contactNo: string
  contactName: string | null
  errorMessage: string | null
  createdAt: string
  field: string
}

export interface WhatsAppMessagesResponse {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  data: WhatsAppMessageDto[]
  success: boolean
  message: string | null
  errors: unknown
}
