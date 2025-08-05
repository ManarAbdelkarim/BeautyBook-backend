const express = require('express');
const router = express.Router();
const { authMiddleware, allowRoles } = require('../middlewares/auth.middleware');
const controller = require('../controllers/services.controller');

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', allowRoles('ADMIN'), controller.create);
router.put('/restore/', allowRoles('ADMIN'), controller.restore);
router.put('/:id', allowRoles('ADMIN'), controller.update);
router.delete('/:id', allowRoles('ADMIN'), controller.remove);

module.exports = router;
