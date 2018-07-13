import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const Schema = mongoose.Schema;

const AppUserSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full Name Field is required']
  },

  emailid: {
    type: String,
    required: [true, 'Email Field is required'],
    unique: true
  },

  password: {
    type: String,
    required: [true, 'password Field is required']
  },

  mobileNumber: {
    type: String,
    required: [true, 'mobilenumber Field is required']
  },
  active: {
    type: Boolean,
    default: false
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  activationCode: {
    type: String
  }
});

AppUserSchema.methods = {
  checkPassword: function(inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password);
  },
  hashPassword: plainTextPassword => {
    console.log(plainTextPassword);
    return bcrypt.hashSync(plainTextPassword, 10);
  }
};

AppUserSchema.pre('save', function(next) {
  if (!this.password) {
    console.log('models/user.js =======NO PASSWORD PROVIDED=======');
    next();
  } else {
    console.log('models/user.js hashPassword in pre save');
    this.password = this.hashPassword(this.password);
    this.activationCode = this.hashPassword(this.id);
    next();
  }
});

// cREATE Model
const AppUser = mongoose.model('appuser', AppUserSchema);
export default AppUser;
