const Router = require("express").Router;
const router = new Router();
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const User = require("../models/user");
const ExpressError = require("../expressError");

/** GET / - get list of users.
 * => {users: [{username, first_name, last_name, phone}, ...]}
 **/
router.get("/", async (req, res, next) => {
  try {
    const users = await User.all();
    return res.json(users);
  } catch (e) {
    return next(e);
  }
});

/** GET /:username - get detail of users.
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 **/
router.get("/:username", ensureCorrectUser, async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.get(username);
    return res.json(user);
  } catch (e) {
    return next(e);
  }
});

/** GET /:username/to - get messages to user
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 **/
router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
  try {
    const { username } = req.params;
    const messages = await User.messagesTo(username);
    console.log("messages", messages);
    return res.json(messages);
  } catch (e) {
    return next(e);
  }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", async (req, res, next) => {
  try {
    const { username } = req.params;
    const messages = await User.messagesFrom(username);
    return res.json(messages);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
