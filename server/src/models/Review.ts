import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  course: Types.ObjectId;
  student: Types.ObjectId;
  rating: number;
  comment: string;
  isModerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isModerated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one review per student per course
reviewSchema.index({ student: 1, course: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);
