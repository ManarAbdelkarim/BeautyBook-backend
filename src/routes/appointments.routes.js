const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const controller = require('../controllers/appointments.controller');

router.use(authMiddleware);

router.get('/', controller.getAllAppointments);
router.get('/export/pdf', controller.exportAppointmentsPDF)
router.get('/export/pdf/:id', controller.exportAppointmentByIdPDF)
router.get('/:id', controller.getAppointmentById);
router.post('/', controller.createAppointment);
router.put('/:id', controller.updateAppointment);
router.delete('/:id', controller.deleteAppointment);

module.exports = router;
