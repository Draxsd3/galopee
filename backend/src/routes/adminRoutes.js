const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/metrics', ctrl.metrics);
router.get('/users',   ctrl.users);
router.get('/sellers', ctrl.sellers);
router.get('/orders',  ctrl.orders);

module.exports = router;
