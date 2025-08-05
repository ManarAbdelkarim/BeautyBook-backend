const express = require('express');
const router = express.Router();
const { authMiddleware, allowRoles } = require('../middlewares/auth.middleware');
const controller = require('../controllers/staff.controller');

router.use(authMiddleware);

router.get('/', controller.getAllStaff);
router.get('/:id', allowRoles('ADMIN'), controller.getOneStaff);
router.post('/', allowRoles('ADMIN'), controller.addStaff);
router.put('/restore', allowRoles('ADMIN'), controller.restoreStaff);
router.delete('/:id', allowRoles('ADMIN'), controller.removeStaff);


module.exports = router;
