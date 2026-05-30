export interface N8nPayload {
  userId: string
  action: string
  payload: Record<string, unknown>
}

export async function sendToN8n(data: N8nPayload): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const secret = process.env.N8N_WEBHOOK_SECRET

  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'x-n8n-secret': secret } : {}),
    },
    body: JSON.stringify(data),
  })
}
