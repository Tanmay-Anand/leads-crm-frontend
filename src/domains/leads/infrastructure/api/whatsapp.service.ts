import { env } from "@/infrastructure/config/env"

import type { WhatsAppMessagesResponse } from "../../domain/whatsapp.types"

/**
 * Talks to Engageto directly rather than through `api.getService`: it is a separate third-party
 * host with its own `Api-Key` header, not our backend, so none of the tenant/bearer-token handling
 * in the shared client applies.
 */
export const whatsappService = {
  getMessages: async (
    phoneNumber: string,
    params: { pageNumber?: number; pageSize?: number } = {}
  ): Promise<WhatsAppMessagesResponse> => {
    const query = new URLSearchParams({
      phoneNumber,
      pageNumber: String(params.pageNumber ?? 1),
      pageSize: String(params.pageSize ?? 50)
    })

    const response = await fetch(`${env.whatsapp.apiUrl}/get-waMessage?${query.toString()}`, {
      headers: {
        accept: "*/*",
        "Api-Key": env.whatsapp.apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to load WhatsApp conversation (${response.status})`)
    }

    return (await response.json()) as WhatsAppMessagesResponse
  }
}
