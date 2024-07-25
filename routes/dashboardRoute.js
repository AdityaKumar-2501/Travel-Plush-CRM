const express = require('express');
const router = express.Router();

const {test, getAllLeads, todaysLeads,weeklyLeads, monthlyLeads, everyMonthLeads, userProfile} = require('../controllers/dashboardController.js');

router.get('/',test);
router.get('/leads',getAllLeads)
router.get('/todayleads', todaysLeads)
router.get('/weeklyleads',weeklyLeads )
router.get('/monthlyleads',monthlyLeads)
router.get('/everymonthleads',everyMonthLeads)
router.get('/userprofile',userProfile);

module.exports =  router;