const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
/////////mine
// router.post("/login", async (req, res, next) => {
//   // login with user class
//   // await response. get token if successful. get error if not
//   // if successful. also update last login time
//   try {
//     const { username, password } = req.body; // this should be the right source.
//     //check user exists..
//     const user = await User.get(username);
//     if (user) {
//       const correctUser = await User.authenticate(username, password);
//       if (correctUser) {
//         await User.updateLoginTimestamp(username);
//         //get token:
//         let token = jwt.sign({ username }, SECRET_KEY);
//         return res.json({ token });
//       }
//     }
//     throw new ExpressError("invalid login", 400);
//   } catch (e) {
//     return next(e);
//   }
// });
/////////////////////////////////////////////////////////////////////////////////
//////////////KELLY::////////////////////////////////////////////////////////////
/** POST /login - login: {username, password} => {token} **/
router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Please enter username and password", 400);
    }
    if (await User.authenticate(username, password)) {
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ token });
    } else {
      throw new ExpressError("Invalid username/password", 400);
    }
  } catch (err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token
 * {username, password, first_name, last_name, phone} => {token}
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
  // login with user class
  // await response. get token if successful. get error if not
  // if successful. also update last login time
  try {
    let { username } = req.body;
    const user = await User.get(username);
    if (!user) {
      const newUser = await User.register(req.body);
      await User.updateLoginTimestamp(username);

      //get token:
      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token });
    }
    throw new ExpressError("Username already exists", 404);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
