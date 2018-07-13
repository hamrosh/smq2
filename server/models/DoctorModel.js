import mongoose from 'mongoose';
import { AddressSchema } from './AddressModel';

const Schema = mongoose.Schema;

const DoctorSchema = new Schema({
  doctorName: {
    type: String,
    required: [true, 'Doctor Name Field is required']
  },
  hospitalID: [String],
  department: [
    {
      name: String,
      description: String
    }
  ],
  address: AddressSchema,
  contact: {
    mobile1: String,
    mobile2: String
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  createdBy: String
});
// cREATE Model
const Doctor = mongoose.model('doctor', DoctorSchema);
export default Doctor;
