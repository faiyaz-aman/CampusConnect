const router = require('express').Router();
const c = require('../controllers/adminController');
const { auth, requireRole } = require('../middleware/auth');

// Protect all routes in this file to Admins only
router.use(auth(), requireRole('admin'));

router.get('/events', c.events);
router.put('/events/:id/approve', c.approveEvent);
router.put('/events/:id/feature', c.featureEvent);
router.get('/clubs', c.clubs);
router.put('/clubs/:id/verify', c.verifyClub);
router.get('/analytics', c.analytics);

module.exports = router;
