import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { withAuth } from '@/lib/middleware';
import { createTaskSchema, taskQuerySchema } from '@/lib/validations';
import {
  successResponse,
  handleApiError,
  sanitizeInput,
} from '@/lib/api-utils';

/**
 * GET /api/tasks
 * Get all tasks for authenticated user with filtering, sorting, and pagination
 */
export const GET = withAuth(async (request, user) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);

    // Validate and parse query parameters
    const {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = taskQuerySchema.parse(queryParams);

    // Build query filter
    const filter: any = { userId: user.userId };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination and sorting
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    return successResponse(tasks, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/tasks
 * Create a new task for authenticated user
 */
export const POST = withAuth(async (request, user) => {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validatedData = createTaskSchema.parse(body);

    // Sanitize text fields
    const sanitizedData = {
      ...validatedData,
      title: sanitizeInput(validatedData.title),
      description: validatedData.description
        ? sanitizeInput(validatedData.description)
        : '',
      tags: validatedData.tags.map((tag) => sanitizeInput(tag)),
      userId: user.userId,
    };

    // Create task
    const task = await Task.create(sanitizedData);

    return successResponse(task, 201);
  } catch (error) {
    return handleApiError(error);
  }
});
