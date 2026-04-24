const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('buyer', 'seller'));

router.get('/',             ctrl.get);
router.post('/items',       ctrl.add);
router.put('/items/:itemId', ctrl.update);
router.delete('/items/:itemId', ctrl.remove);
router.delete('/',          ctrl.clear);

module.exports = router;
