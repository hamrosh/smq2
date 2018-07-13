import Operator from '../models/OperatorModel';
import LocalStrategy from 'passport-local';

const strategy = new LocalStrategy(
  {
    usernameField: 'operatorID' // not necessary, DEFAULT
  },
  function(operatorID, password, done) {
    Operator.findOne({ operatorID: operatorID }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect operator ID' });
      }

      if (!user.checkPassword(password)) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    });
  }
);

module.exports = strategy;
