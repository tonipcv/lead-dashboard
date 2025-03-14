import type { NextRequest, NextFetchEvent } from "next/server"
import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"

// Force dynamic rendering for authentication routes
export const dynamic = "force-dynamic"

// Specify Node.js runtime for NextAuth compatibility
export const runtime = "nodejs"

type AppRouteHandler = (
  req: NextRequest,
  context: NextFetchEvent
) => Promise<NextResponse>

const handler = NextAuth(authOptions) as unknown as AppRouteHandler

export { handler as GET, handler as POST } 