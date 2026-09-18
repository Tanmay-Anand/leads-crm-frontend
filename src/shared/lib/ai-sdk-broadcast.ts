/**
 * Announces which lead is open in this CRM, for anything listening on the page - the browser
 * extension's content script today, the bundled ai-sdk widget potentially later. Same-origin
 * `postMessage` works regardless of whether the sheet was opened by a row click, a deep link, or
 * programmatically, which a DOM-attribute-only signal cannot promise (the sheet is a React
 * state-driven overlay, not a route change - the URL never carries the lead id).
 *
 * Mirrored onto `document.body` as `data-ai-sdk-*` attributes at the same time, matching the
 * convention `leads-table.tsx` already uses per row, so a listener that prefers DOM polling over
 * message events has something to read too.
 */

export interface LeadOpenedMessage {
  source: "leads-crm"
  type: "LEAD_OPENED"
  leadId: string
  leadCode: string | null
  projectId: string | null
  projectName: string | null
  at: string
}

export interface LeadClosedMessage {
  source: "leads-crm"
  type: "LEAD_CLOSED"
}

interface BroadcastableLead {
  id: string
  leadCode?: string | null
  projectId?: string | null
}

export function broadcastLeadOpened(lead: BroadcastableLead, projectName: string | null): void {
  const message: LeadOpenedMessage = {
    source: "leads-crm",
    type: "LEAD_OPENED",
    leadId: lead.id,
    leadCode: lead.leadCode ?? null,
    projectId: lead.projectId ?? null,
    projectName,
    at: new Date().toISOString()
  }
  window.postMessage(message, window.location.origin)

  document.body.dataset.aiSdkEntity = "Lead"
  document.body.dataset.aiSdkId = lead.id
  if (lead.projectId) {
    document.body.dataset.leadProjectId = lead.projectId
  } else {
    delete document.body.dataset.leadProjectId
  }
}

export function broadcastLeadClosed(): void {
  const message: LeadClosedMessage = { source: "leads-crm", type: "LEAD_CLOSED" }
  window.postMessage(message, window.location.origin)

  delete document.body.dataset.aiSdkEntity
  delete document.body.dataset.aiSdkId
  delete document.body.dataset.leadProjectId
}
