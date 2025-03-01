const router = require("express").Router();
const bcrypt = require('bcryptjs')
const Users = require('../users/users-model')
const tokenBuilder = require('./token-builder')
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');

router.post("/register", validateRoleName, (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
  let user = req.body
  const hash = bcrypt.hashSync(user.password, 8)
  user.password = hash

  Users.add(user)
    .then((newUser) => {
      res.status(201).json(newUser)
    })
    .catch(next)
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
  const {password} = req.body
  if (bcrypt.compareSync(password, req.user.password)) {
    const token = tokenBuilder(req.user)
    res.status(200).json({
      message: `${req.user.username} is back!`,
      token
    })
  } else {
    next({
      status: 401,
      message: 'Invalid credentials'
    })
  }
});

module.exports = router;
