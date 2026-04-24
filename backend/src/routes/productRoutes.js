const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

// Público
router.get('/',           ctrl.list);
router.get('/categories', ctrl.listCategories);

// Área do vendedor (antes do :id para não colidir)
router.get('/mine',   authenticate, authorize('seller', 'admin'), ctrl.listMine);
router.post('/',      authenticate, authorize('seller', 'admin'), ctrl.create);
router.put('/:id',    authenticate, authorize('seller', 'admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('seller', 'admin'), ctrl.remove);

router.get('/:id', ctrl.getOne);

module.exports = router;
