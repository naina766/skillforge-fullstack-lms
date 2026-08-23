import { Schema, model, Document, Types } from 'mongoose';

export interface IWishlistItem extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique bookmark per course per user
wishlistItemSchema.index({ user: 1, course: 1 }, { unique: true });

export const WishlistItem = model<IWishlistItem>('WishlistItem', wishlistItemSchema);
