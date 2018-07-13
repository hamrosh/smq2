import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const StatusHistorySchema = new Schema(
  {
    status: String, // incomplete,started, cancelled, completed
    setOn: Date,
    setBy: String
  },
  { _id: false }
);
