import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const Schema = mongoose.Schema;
export const AddressSchema = new Schema(
  {
    address: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String
  },
  { _id: false }
);
