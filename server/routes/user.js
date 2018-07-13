const express = require('express');
const router = express.Router();
const passport = require('../passport');

// router.post(
//   '/login',
//   function(req, res, next) {
//     console.log('routes/user.js, login, req.body: ');
//     console.log(req.body);
//     next();
//   },
//   passport.authenticate('local'),
//   (req, res) => {
//     var userInfo = {
//       id: req.user.id,
//       emailid: req.user.emailid,
//       fullname: req.user.fullname
//     };
//     res.send(userInfo);
//   }
// );

router.get('/', (req, res, next) => {
  console.log('===== user!!======');

  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (info) {
      return res.send(info);
    }
    // req / res held in closure
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      var userInfo = {
        operatorName: user.operatorName,
        operatorType: user.operatorType
      };

      return res.send(userInfo);
    });
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  if (req.user) {
    req.logout();
    res.send({ msg: 'logging out' });
  } else {
    res.send({ msg: 'no user to log out' });
  }
});

module.exports = router;
