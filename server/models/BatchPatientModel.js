import mongoose from 'mongoose';

import { StatusHistorySchema } from './StatusHistoryModel';
const Schema = mongoose.Schema;

const BatchPatientSchema = new Schema({
  batchID: {
    type: String,
    required: [true, 'Batch ID Field is required']
  },
  patientID: {
    type: String,
    required: [true, 'Patient ID Field is required']
  },
  patientNumber: String,
  sequenceNumber: {
    type: Number,
    default: 0
  },
  pushedTimes: {
    type: Number,
    default: 0
  },
  currentStatus: String,
  statusHistory: [StatusHistorySchema],
  totalTimeWithDoctor: String,
  createdDate: {
    type: Date,
    default: Date.now
  },
  operatorID: String
});

BatchPatientSchema.index({ batchID: 1, patientID: 1 }, { unique: true });

// cREATE Model
const BatchPatient = mongoose.model('batchpatient', BatchPatientSchema);
export default BatchPatient;
