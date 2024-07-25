const express = require("express")
const router = express.Router()

const userRouter  = require("./userRoute.js");
const leadRouter = require("./leadRoute.js");
const todoRouter = require("./todoRoute.js");
const uploadRouter = require("./uploadExcelRoute.js");
const dashboardRouter = require('./dashboardRoute.js');

//user routers
router.use("/user", userRouter)
router.use("/lead", leadRouter)
router.use("/todo", todoRouter)
router.use("/upload",uploadRouter)
router.use("/dashboard", dashboardRouter)

module.exports = router