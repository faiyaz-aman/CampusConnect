const router = require('express').Router();
const c = require('../controllers/eventController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', c.list);
router.get('/recommended', auth(), c.recommended);
router.get('/my/activity', auth(), c.myActivity); // Declared before /:id to prevent route parameter collision
router.get('/:id', auth(false), c.get);
router.post('/', auth(), requireRole('organizer'), c.create);
router.put('/:id', auth(), requireRole('organizer'), c.update);
router.delete('/:id', auth(), requireRole('organizer'), c.remove);
router.post('/:id/register', auth(), requireRole('student'), c.register);
router.post('/:id/cancel', auth(), requireRole('student'), c.cancelRSVP);
router.get('/:id/registrations', auth(), c.registrations);
router.post('/:id/checkin', auth(), requireRole('organizer'), c.checkin);
router.post('/:id/feedback', auth(), requireRole('student'), c.submitFeedback);
router.get('/:id/feedback', c.getFeedback);
router.post('/:id/save', auth(), requireRole('student'), c.toggleSave);
router.get('/:id/save', auth(), requireRole('student'), c.isSaved);

module.exports = router;
