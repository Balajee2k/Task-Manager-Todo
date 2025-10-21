import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { withAuth } from '@/lib/middleware';
import { updateTaskSchema } from '@/lib/validations';
import {
  successResponse,
  handleApiError,
  ApiError,
  sanitizeInput,
} from '@/lib/api-utils';

/**
 * GET /api/tasks/:id
 * Get a specific task by ID
 */
export const GET = withAuth(
  async (request, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      await connectDB();

      const { id } = await params;

      const task = await Task.findOne({
        _id: id,
        userId: user.userId,
      }).lean();

      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      return successResponse(task);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/**
 * PATCH /api/tasks/:id
 * Update a specific task
 */
export const PATCH = withAuth(
  async (request, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      await connectDB();

      const { id } = await params;
      const body = await request.json();

      // Validate input
      const validatedData = updateTaskSchema.parse(body);

      // Sanitize text fields if present
      const sanitizedData: any = {};
      if (validatedData.title) {
        sanitizedData.title = sanitizeInput(validatedData.title);
      }
      if (validatedData.description !== undefined) {
        sanitizedData.description = validatedData.description
          ? sanitizeInput(validatedData.description)
          : '';
      }
      if (validatedData.tags) {
        sanitizedData.tags = validatedData.tags.map((tag) => sanitizeInput(tag));
      }
      if (validatedData.status) {
        sanitizedData.status = validatedData.status;
      }
      if (validatedData.priority) {
        sanitizedData.priority = validatedData.priority;
      }
      if (validatedData.dueDate !== undefined) {
        sanitizedData.dueDate = validatedData.dueDate;
      }

      // Update task
      const task = await Task.findOneAndUpdate(
        { _id: id, userId: user.userId },
        { $set: sanitizedData },
        { new: true, runValidators: true }
      ).lean();

      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      return successResponse(task);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/**
 * DELETE /api/tasks/:id
 * Delete a specific task
 */
export const DELETE = withAuth(
  async (request, user, { params }: { params: Promise<{ id: string }> }) => {
    try {
      await connectDB();

      const { id } = await params;

      const task = await Task.findOneAndDelete({
        _id: id,
        userId: user.userId,
      }).lean();

      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      return successResponse({ message: 'Task deleted successfully', task });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
