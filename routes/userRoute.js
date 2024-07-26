const express = require("express")
const router = express.Router()

const dotenv = require("dotenv");
dotenv.config();

const verifyToken = require("../middlewares/authentication");
const { getUser, signUpSuperAdmin, resetPassword, changeTeamPassword, checkUserRoute, postUser, updateUser, deleteUser, payNotifications, sentOtp, verifyOtp, LoginUser } = require("../controllers/userController");


router.get("/", checkUserRoute)

router.post("/signup", signUpSuperAdmin)
router.post("/login", LoginUser);
// router.post("/resetPassword", resetPassword)
// router.post("/changeTeamPassword", changeTeamPassword)
router.get("/payNotifications", verifyToken, payNotifications)



router.get("/get", verifyToken, getUser);
router.post("/post", verifyToken, postUser)
router.post("/update", verifyToken, updateUser)
router.delete("/delete", verifyToken, deleteUser)
router.post('/resetPassword', verifyToken, resetPassword)

router.post("/sendOtp", sentOtp)
router.post("/verifyotp", verifyOtp)


module.exports = router