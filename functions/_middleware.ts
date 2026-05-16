type Env = {
  DASHBOARD_BASIC_USER?: string
  DASHBOARD_BASIC_PASS?: string
}

type PagesContext = {
  request: Request
  env: Env
  next: () => Promise<Response>
}

const REALM = 'AZG Tyres Dashboard'

function unauthorized(message = 'Authentication required') {
  return new Response(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
    },
  })
}

function decodeBasicAuth(header: string | null): { user: string; pass: string } | null {
  if (!header?.startsWith('Basic ')) return null
  try {
    const decoded = atob(header.slice('Basic '.length).trim())
    const separator = decoded.indexOf(':')
    if (separator < 0) return null
    return {
      user: decoded.slice(0, separator),
      pass: decoded.slice(separator + 1),
    }
  } catch {
    return null
  }
}

export const onRequest = async ({ request, env, next }: PagesContext) => {
  const configuredUser = env.DASHBOARD_BASIC_USER
  const configuredPass = env.DASHBOARD_BASIC_PASS

  if (!configuredUser || !configuredPass) {
    return new Response('Dashboard basic auth is not configured.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const credentials = decodeBasicAuth(request.headers.get('Authorization'))
  if (!credentials) return unauthorized()

  if (credentials.user !== configuredUser || credentials.pass !== configuredPass) {
    return unauthorized('Invalid username or password')
  }

  const response = await next()
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', headers.get('Cache-Control') || 'private, no-store')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}
