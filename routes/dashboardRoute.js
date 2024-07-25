const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const {test, getAllLeads, todaysLeads,weeklyLeads, monthlyLeads, everyMonthLeads, userProfile} = require('../controllers/dashboardController.js');

router.get('/',test);
router.get('/leads',verifyToken,getAllLeads)
router.get('/todayleads',verifyToken, todaysLeads)
router.get('/weeklyleads',verifyToken,weeklyLeads )
router.get('/monthlyleads',verifyToken,monthlyLeads)
router.get('/everymonthleads',verifyToken,everyMonthLeads)
router.get('/userprofile',verifyToken,userProfile);

module.exports =  router;