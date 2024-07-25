const express = require('express');
const router = express.Router();

const { testRouter, getAllLeads, createLead, updateLead, deleteLead, filterLead,golbalSearch, downloadLeads } = require('../controllers/leadController');

// router.get('/', testRouter)
router.get('/get', getAllLeads)
router.post('/post', createLead)
router.put('/update', updateLead)
router.delete('/delete', deleteLead)
router.post('/filter', filterLead);
router.get('/', golbalSearch);

// Download route
router.get('/download', downloadLeads);

module.exports = router;