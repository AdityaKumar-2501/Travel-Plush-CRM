const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const { testRouter, getAllLeads, createLead, updateLead, deleteLead, filterLead,golbalSearch, downloadLeads, assignLead } = require('../controllers/leadController');

// router.get('/', testRouter)
router.get('/get',verifyToken, getAllLeads)
router.post('/post',verifyToken, createLead)
router.put('/update',verifyToken, updateLead)
router.delete('/delete',verifyToken, deleteLead)
router.post('/filter',verifyToken, filterLead);
router.get('/',verifyToken, golbalSearch);

router.post('/assign',verifyToken, assignLead);
// Download route
router.get('/download',verifyToken, downloadLeads);

module.exports = router;