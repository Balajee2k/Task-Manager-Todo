import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, JWTPayload } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

/**
 * Extended NextRequest with user information
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate requests using JWT
 * @param request - Next.js request object
 * @returns User payload or throws error
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<JWTPayload> {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (!token) {
    throw new Error('Authentication required');
  }

  const payload = verifyToken(token);

  if (!payload) {
    throw new Error('Invalid or expired token');
  }

  return payload;
}

/**
 * Higher-order function to protect API routes
 * @param handler - Route handler function
 * @returns Protected route handler
 */
export function withAuth(
  handler: (request: NextRequest, user: JWTPayload, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      const user = await authenticateRequest(request);
      return handler(request, user, context);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(error.message, 401);
      }
      return errorResponse('Authentication failed', 401);
    }
  };
}

/**
 * Check if user has required role
 */
export function requireRole(user: JWTPayload, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}
