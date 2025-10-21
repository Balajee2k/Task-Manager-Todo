import mongoose, { Schema, Model } from 'mongoose';
import { TaskPriority, TaskStatus } from '@/lib/types';

/**
 * Task Interface
 * Defines the structure of a Task document
 */
export interface ITask {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Re-export enums for backward compatibility
export { TaskPriority, TaskStatus };

type TaskModel = Model<ITask>;

/**
 * Task Schema
 * Implements comprehensive validation and indexing for performance
 */
const taskSchema = new Schema<ITask, TaskModel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          // Due date should not be in the past
          if (!value) return true;
          const dueDate = new Date(value);
          const today = new Date();
          // Set both dates to start of day for fair comparison
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate >= today;
        },
        message: 'Due date cannot be in the past',
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound indexes for efficient querying
 */
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

/**
 * Middleware to set completedAt timestamp when status changes to completed
 */
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === TaskStatus.COMPLETED && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== TaskStatus.COMPLETED) {
      this.completedAt = undefined;
    }
  }
  next();
});

/**
 * Export Task model
 * Uses singleton pattern to prevent model recompilation
 */
const Task = (mongoose.models.Task as TaskModel) || 
  mongoose.model<ITask, TaskModel>('Task', taskSchema);

export default Task;
