import mongoose from 'mongoose';

const Schema = mongoose.Schema;
import { AddressSchema } from './AddressModel';
export const ContactSchema = new Schema(
  {
    contactName: String,
    mobile1: String,
    mobile2: String,
    address: AddressSchema
  },
  { _id: false }
);
