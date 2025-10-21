import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import {
  successResponse,
  handleApiError,
  ApiError,
  sanitizeInput,
  checkRateLimit,
  errorResponse,
} from '@/lib/api-utils';

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`register:${ip}`, 5, 3600000); // 5 requests per hour
    
    if (!rateLimit.allowed) {
      return errorResponse('Too many registration attempts. Please try again later.', 429);
    }

    await connectDB();

    const body = await request.json();

    // Validate input with Zod
    const validatedData = registerSchema.parse(body);

    // Additional sanitization
    const sanitizedData = {
      name: sanitizeInput(validatedData.name),
      email: validatedData.email,
      password: validatedData.password,
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedData.email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create(sanitizedData);

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (excluding password)
    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
