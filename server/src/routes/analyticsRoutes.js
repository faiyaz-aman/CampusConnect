const router = require('express').Router();
const c = require('../controllers/analyticsController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/overview', auth(), requireRole('organizer'), c.overview);

module.exports = router;
