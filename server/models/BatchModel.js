import mongoose from 'mongoose';

import { StatusHistorySchema } from './StatusHistoryModel';

const Schema = mongoose.Schema;

const BatchSchema = new Schema({
  hospitalID: String,
  doctorID: String,
  batchName: {
    type: String,
    required: [true, 'Batch Name Field is required']
  },
  batchDate: Date,
  startTime: String,
  endTime: String,
  isBookingOpen: Boolean, // open closed
  statusHistory: [StatusHistorySchema],
  cancellationReason: String,
  createdDate: {
    type: Date,
    default: Date.now
  },
  operatorID: String,
  batchDateString: String,
  batchSequence: [String],
  totalCompletedPatients: {
    type: Number,
    default: 0
  },
  currentStatus: String
});

BatchSchema.index({ batchDateString: 1 });

// cREATE Model
const Batch = mongoose.model('batch', BatchSchema);
export default Batch;
