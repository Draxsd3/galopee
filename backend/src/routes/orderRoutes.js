const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/',             authorize('buyer', 'seller'), ctrl.create);
router.get('/mine',          authorize('buyer', 'seller'), ctrl.listMyPurchases);
router.get('/sales',         authorize('seller', 'admin'), ctrl.listMySales);
router.get('/:id',           ctrl.getOne);
router.patch('/:id/status',  authorize('seller', 'admin'), ctrl.updateStatus);

module.exports = router;
