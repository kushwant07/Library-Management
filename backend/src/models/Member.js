import mongoose from 'mongoose';

/**
 * Minimal Member Schema
 * Used only for calculating the "Total Members" counter on the Dashboard
 */
const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Member = mongoose.model('Member', memberSchema);
