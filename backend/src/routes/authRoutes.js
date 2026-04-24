const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register',       ctrl.register);
router.post('/login',          ctrl.login);
router.get('/me',              authenticate, ctrl.me);
router.put('/me',              authenticate, ctrl.updateMe);
router.post('/become-seller',  authenticate, authorize('buyer', 'seller'), ctrl.becomeSeller);

module.exports = router;
