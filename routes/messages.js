const Router = require("express").Router;
const router = new Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Message = require("../models/message");
const ExpressError = require("../expressError");
const { markRead } = require("../models/message");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    let message = await Message.get(id);
    //check user is currently logged in and either a recipient or sender
    let { username } = req.user;
    if (
      username != message.from_user.username &&
      username != message.to_user.username
    ) {
      throw new ExpressError("Not authorized to view message", 401);
    }

    return res.json(message);
  } catch (e) {
    return next(e);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const { to_username, body } = req.body;
    //from_username ...
    let message = await Message.create(req.user.username, to_username, body);

    return res.json(message);
  } catch (e) {
    return next(e);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.get("/:id/read", ensureLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    let message = await Message.get(id);
    //check user is currently logged in is recipient 
    let { username } = req.user;
    if (username != message.to_user.username) {
      throw new ExpressError("Not authorized", 401);
    }
    let markedRead = await markRead(id);

    return res.json(markedRead);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
