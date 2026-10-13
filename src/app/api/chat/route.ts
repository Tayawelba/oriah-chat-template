import { configFromEnv, parseChatRequest, runChat } from '@/lib/elle/engine'
import { createRateLimiter } from '@/lib/elle/rate-limit'
import type { ChatEvent } from '@/lib/chat/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const config = configFromEnv()
const rateLimit = createRateLimiter({ limit: 20, windowMs: 60_000 })

function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
}

const encoder = new TextEncoder()
const line = (event: ChatEvent) => encoder.encode(`${JSON.stringify(event)}\n`)

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request))
  if (!limited.allowed) {
    return Response.json(
      { error: 'Trop de messages en peu de temps. Patientez un instant. En cas d’urgence : 117 (Police) ou 113 (Gendarmerie).' },
      { status: 429, headers: { 'retry-after': String(limited.retryAfterSeconds) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }
  const parsed = parseChatRequest(body)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of runChat(parsed.request, config, request.signal)) controller.enqueue(line(event))
      } catch {
        controller.enqueue(line({ type: 'error', message: 'Service momentanément indisponible. En cas d’urgence : 117 ou 113.', kind: 'server' }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}
