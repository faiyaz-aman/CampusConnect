const router = require('express').Router();
const c = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.post('/', auth(false), c.chat);

module.exports = router;
