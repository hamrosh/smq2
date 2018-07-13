import mongoose from 'mongoose';
import { AddressSchema } from './AddressModel';
import { ContactSchema } from './ContactModel';

const Schema = mongoose.Schema;

const HospitalSchema = new Schema({
  hospitalName: {
    type: String,
    required: [true, 'Hospital Name Field is required']
  },
  address: AddressSchema,
  contacts: [ContactSchema],
  createdBy: String,
  createdDate: {
    type: Date,
    default: Date.now
  }
});
// cREATE Model
const Hospital = mongoose.model('hospital', HospitalSchema);
export default Hospital;
