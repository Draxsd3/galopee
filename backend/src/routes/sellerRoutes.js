const router = require('express').Router();
const ctrl = require('../controllers/sellerController');
const authCtrl = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/',              ctrl.listAll);
router.post('/become',       authenticate, authorize('buyer', 'seller'), authCtrl.becomeSeller);
router.get('/me',            authenticate, authorize('seller', 'admin'), ctrl.myStore);
router.put('/me',            authenticate, authorize('seller', 'admin'), ctrl.updateMyStore);
router.get('/:slug',         ctrl.getBySlug);

module.exports = router;
