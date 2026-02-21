const express = require('express');
const router = express.Router();
const contactLeadsController = require('../controllers/contactLeadsController');
const { auth } = require('../middlewares/auth');

router.post('/', contactLeadsController.createContactLead);
router.get('/', auth, contactLeadsController.getAllContactLeads);
router.get('/:id', auth, contactLeadsController.getContactLeadById);
router.put('/:id/status', auth, contactLeadsController.updateContactLeadStatus);
router.delete('/:id', auth, contactLeadsController.deleteContactLead);

module.exports = router;
