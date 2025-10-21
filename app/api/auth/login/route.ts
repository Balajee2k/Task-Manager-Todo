import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import {
  successResponse,
  handleApiError,
  ApiError,
  checkRateLimit,
  errorResponse,
} from '@/lib/api-utils';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`login:${ip}`, 10, 900000); // 10 requests per 15 minutes
    
    if (!rateLimit.allowed) {
      return errorResponse('Too many login attempts. Please try again later.', 429);
    }

    await connectDB();

    const body = await request.json();

    // Validate input with Zod
    const validatedData = loginSchema.parse(body);

    // Find user with password field included
    const user = await User.findOne({ email: validatedData.email }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (excluding password)
    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
