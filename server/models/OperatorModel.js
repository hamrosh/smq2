import mongoose from 'mongoose';
import { AddressSchema } from './AddressModel';

import bcrypt from 'bcryptjs';
const Schema = mongoose.Schema;

const OperatorSchema = new Schema({
  operatorName: {
    type: String,
    required: [true, 'Operator Name Field is required']
  },
  operatorID: {
    type: String,
    required: [true, 'Operator ID Field is required']
  },
  password: {
    type: String,
    required: [true, 'Operator Password Field is required']
  },
  operatorType: String,
  hospitalID: String,
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

OperatorSchema.index({ operatorID: 1 }, { unique: true });

OperatorSchema.methods = {
  checkPassword: function(inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password);
  },
  hashPassword: plainTextPassword => {
    console.log(plainTextPassword);
    return bcrypt.hashSync(plainTextPassword, 10);
  }
};

OperatorSchema.pre('save', function(next) {
  if (!this.password) {
    console.log('models/user.js =======NO PASSWORD PROVIDED=======');
    next();
  } else {
    console.log('models/user.js hashPassword in pre save');
    this.password = this.hashPassword(this.password);
    next();
  }
});

// cREATE Model
const Operator = mongoose.model('operator', OperatorSchema);
export default Operator;
