const express = require("express");
router = express.Router();

//npm
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//model
const { User, Verification } = require("../models/user");

const checkUserRoute = (req, res) => {
	return res.status(200).send("welcome to user controllers");
};

async function signUpSuperAdmin(req, res) {
	const email = req.body.email.toLowerCase();
	const name = req.body.name;
	const mobile = req.body.mobile;
	const profile = "superAdmin";
	const hashedPassword = await bcrypt.hash(req.body.password, 10);
	try {
		const foundUser = await User.findOne({ email: email }).exec();

		if (foundUser) {
			return res.status(400).json({ error: "Email Id Already Exists" });
		}
		const currentDate = new Date().toDateString();
		const newUser = new User({
			seized: false,
			name,
			email,
			mobile: mobile,
			profile,
			password: hashedPassword,
			paidDateCreated: currentDate,
			orgSubscriptionAmount: "12000",
			byeHost: "smtpout.secureserver.net",
			byePort: "587",
			officeLat: "28.59545732751747",
			officeLong: "77.32214856055862",
			userStatus: true,
			//with 18%gst this will have 15 users after that we will take 1000 rs per user to add till subscription date
		});

		await newUser.save();

		return res.status(200).send("User Created Successfully!");
	} catch (error) {
		return res.status(400).send(`Internal server error ${error.message}`);
	}
}

async function LoginUser(req, res) {
	// console.log("we are in login and checking inbody", req.body)
	const { email, password } = req.body;
	if (!email || !password)
		return res.status(400).send("Please provide all the details!");

	const userData = await User.findOne({ email: email.toLowerCase() });

	if (!userData) {
		return res.status(400).send("Invalid login username");
	}

	// console.log("user data", userData)

	try {
		const mobile = userData.mobile;
		if (userData.seized) {
			//console.log("we are in true block")
			const twilioClient = new Twilio(
				process.env.TWILIO_ACCOUNT_SID,
				process.env.TWILIO_AUTH_TOKEN
			);
			const message = await twilioClient.messages.create({
				body: `your subscription has now lapsed. kindly make a payment on the following link to reinstate access to our services. make sure to enter correct email address! - https://legalpapers-payments.onrender.com/view/initiate_payment.html`,
				from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
				to: `+91${mobile}`, // Number of the person you tried to reach
			});
			return res
				.status(400)
				.send(
					"Your account has undergone a suspension. To reinstate access and restore its functionality, a payment is required. Please proceed with the payment to regain access to your account. payment link has been sent on your registered Mobile!"
				);
		}
		const isPasswordMatch = await bcrypt.compare(
			password,
			userData.password
		);
		if (!isPasswordMatch) {
			return res.status(400).send("Invalid login password");
		}

		//add 3 extra zero for testing in expiresIn time
		const token = jwt.sign(
			{ foundUser: userData },
			`${process.env.JWTPRIVATEKEY}`,
			{ expiresIn: "9h" }
		);
		return res.status(200).send({ token, message: "Signin Successful!" });
	} catch (err) {
		// console.log(`internal server error - ${err.message}`)
		return res.status(500).send(`Internal server error - ${err.message}`);
	}
}

async function resetPassword(req, res) {
	// console.log("we are in reset password", req.body)
	try {
		const { currentPassword, newPassword, confirmPassword, email } =
			req.body;

		const foundUser = await User.findOne({ email });

		if (!foundUser) return res.status(400).send("User not found!");
		const isPasswordMatch = await bcrypt.compare(
			currentPassword,
			foundUser.password
		);
		if (!isPasswordMatch) {
			return res.status(400).send("Incorrect Current password");
		}
		// Check  newPassword and confirmPassword
		if (newPassword !== confirmPassword) {
			return res
				.status(400)
				.send(
					`New password and Confirm password do not match. Try again later!`
				);
		}

		// Hash the new password
		const saltRounds = 10;
		const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

		const updatedUser = await User.findOneAndUpdate(
			{ email },
			{ $set: { password: newPasswordHash } },
			{ new: true }
		);
		// console.log("updatedUser", updatedUser)
		res.status(200).send(`Password reset successfully.`);
	} catch (error) {
		res.status(500).send(`Internal Server Error - ${error.message}`);
	}
}

// ? Currently no need of this function

async function changeTeamPassword(req, res) {
	try {
		const { newPassword, confirmPassword, email } = req.body;
		const foundUser = await User.findOne({ email });
		if (!foundUser) return res.status(400).send("Employee not found!");
		// Check  newPassword and confirmPassword
		if (newPassword !== confirmPassword) {
			return res
				.status(400)
				.send(
					`New password and Confirm password do not match. Try again later!`
				);
		}

		// Hash the new password
		const saltRounds = 10;
		const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

		const updatedUser = await User.findOneAndUpdate(
			{ email },
			{ $set: { password: newPasswordHash } },
			{ new: true }
		);
		// console.log("updatedUser", updatedUser)
		res.status(200).send(`Password reset successfully.`);
	} catch (error) {
		res.status(500).send(`Internal Server Error - ${error.message}`);
	}
}

// ? Only SuperAdmin can all users or any user.

async function getUser(req, res) {
	const page = req.query.page - 1 || 0; // subtracted 1 so that first 3 will not skip
	const pageSize = 10;
	const skip = page * pageSize;

	if (page < 0) return res.status(400).send("Invalid page number");

	try {
		const { profile } = req.foundUser;

		let allUser;
		if (profile === "superAdmin") {
			allUser = await User.find();

			const totalUsers = allUser.length;
			const totalPages = Math.ceil(totalUsers / pageSize);

			return res.status(200).json({
				message: "Pagination search successfully!",
				data: allUser,
				totalUsers,
				currentPage: page + 1,
				totalPages,
			});
		}
		else{
			res.status(400).send("Unauthorized");
		}

	} catch (error) {
		console.log("error:", error);
		return res.status(500).send(`Internal server error - ${error.message}`);
	}
}

async function postUser(req, res) {
	const { email, name, mobile, password, profile } = req.body;
	if (!email || !name || !mobile || !password || !profile)
		return res.status(400).send("Provide all the Details!");
	const checkUsers = await User.find({});
	if (checkUsers.length >= 20) {
		//we will increase it manually when they ppay us thtough a contact thorugh sales person. just manually increase the length and we are done
		return res
			.status(400)
			.send(
				"You have exceeded the maximum number of registered users. kindly make a payment through our Sales Executive to reinstate access to our services."
			);
	}

	try {
		const foundUser = await User.findOne({
			email: email.toLowerCase(),
		}).exec();
		const hashedPassword = await bcrypt.hash(password, 10);
		if (foundUser) return res.status(400).send("Email Id Already Exists");

		const newUser = new User({
			seized: false,
			name,
			email: email.toLowerCase(),
			mobile: mobile,
			profile,
			password: hashedPassword,
		});

		await newUser.save();
		res.status(200).send("User created successfully");
	} catch (error) {
		res.status(500).send(`Internal server error - ${error.message}`);
	}
}

async function updateUser(req, res) {
	let { email, name, profile, newPassword, confirmPassword } = req.body;
	console.log("req.body", req.body);

	if (!email || !name || !profile)
		return res.status(400).send("provide all the required data!");
	try {
		if (newPassword !== undefined && confirmPassword !== undefined) {
			if (!newPassword || newPassword !== confirmPassword) {
				return res
					.status(400)
					.send("New password and confirm password didn't match");
			} else {
				const saltRounds = 10;
				const hashedPassword = await bcrypt.hash(
					newPassword,
					saltRounds
				);
				const updatedUser = await User.findOneAndUpdate(
					{ email },
					{ password: hashedPassword },
					{
						new: true,
					}
				);
			}
		}
		// if (userStatus !== undefined) {
		// 	if (userStatus === "true") {
		// 		userStatus = true;
		// 	} else if (userStatus === "false") {
		// 		userStatus = false;
		// 	}
		// }

		const updatedUser = await User.findOneAndUpdate(
			{ email },
			{ email, name, profile },
			{
				new: true,
			}
		);
		if (!updatedUser) {
			return res.status(400).send("User not updated");
		}

		return res.status(200).send("User updated successfully");
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).send(`Internal server error: ${error.message}`);
	}
}

async function deleteUser(req, res) {
	const email = req.body.email;
	try {
		const foundUser = await User.findOne({ email });
		if (!foundUser) return res.status(400).send("User not found!");
		const deletedUser = await User.findByIdAndDelete(foundUser.id);
		if (!deletedUser) {
			return res.status(400).send(`User not deleted!`);
		}
		return res.status(200).send("User Deleted successfully");
	} catch (error) {
		return res.status(500).send(`Internal Server Error - ${error.message}`);
	}
}

// ? Cureently payNotifications, sent

async function payNotifications(req, res) {
	const email = req.foundUser.email;
	const mobile = req.foundUser.mobile;
	try {
		const foundUser = await User.findOne({ email });
		if (!foundUser) {
			return res.status(400).send("User not found!");
		}
		// console.log(foundUser);
		// Check if a subscription is available
		const paidDate = foundUser.paidDateCreated;
		// console.log("paid date", paidDate);
		if (paidDate) {
			const currentDate = new Date();
			const savedDate = new Date(foundUser.paidDateCreated);
			savedDate.setDate(savedDate.getDate() + 365);
			const timeDifference = Math.abs(currentDate - savedDate);
			// console.log("currentdate",currentDate,"savedDate",savedDate)
			const daysDifference = Math.ceil(
				timeDifference / (1000 * 60 * 60 * 24)
			);

			// if (daysDifference > 335 && daysDifference <= 365) {
			if (daysDifference <= 20) {
				// console.log("day diff", daysDifference);
				return res
					.status(200)
					.send(`Payment is due! Due date is ${savedDate}`);
			} else if (daysDifference > 365) {
				// console.log("Date is older than 365 days.");
				const seizedUser = await EmailUser.findOneAndUpdate(
					{ email },
					{ $set: { seized: true } }
				);
				//console.log("Check the updated seized", seizedUser);
				const twilioClient = new Twilio(
					process.env.TWILIO_ACCOUNT_SID,
					process.env.TWILIO_AUTH_TOKEN
				);
				const message = await twilioClient.messages.create({
					body: `your subscription has now lapsed. kindly make a payment on the following link to reinstate access to our services. make sure to enter correct email address! - 
                    https://legalpapers-payments.onrender.com/view/initiate_payment.html`,
					from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
					to: `+91${mobile}`, // Number of the person you tried to reach
				});
				return res
					.status(400)
					.send(
						`Your subscription, which was active until the date of ${savedDate}, has now lapsed. To reinstate access to our services, we kindly request that you proceed with the payment process which has been sent on your registered Mobile!`
					);
			} else {
				console.log("day diff", daysDifference);
				return res.status(200).send(null);
			}
		} else {
			return res.status(200).send(null);
		}
	} catch (error) {
		console.error("An error occurred:", error.message);
		return res.status(500).send(`Internal Server Error - ${error.message}`);
	}
}

async function sentOtp(req, res) {
	const randomNumber =
		Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
	const otp = randomNumber.toString();

	try {
		// let email = req.body.email;
		// let findUser = await User.findOne({ email });
		// console.log(findUser)
		// if (findUser) {
		// 	return res
		// 		.status(400)
		// 		.json({ message: "Email Already Registered" });
		// }
		// let userOtp = await Verification.findOne({ email });
		// console.log(userOtp)
		// if (userOtp) {
		// 	userOtp.otp = otp;
		// 	await userOtp.save();
		// } else {
		// 	userOtp = new Verification({ email, otp });
		// 	await userOtp.save();
		// }

		const email = req.body.email;

		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}

		let findUser = await User.findOne({ email });
		console.log(findUser);
		if (findUser) {
			return res
				.status(400)
				.json({ message: "Email Already Registered" });
		}

		let userOtp = await Verification.findOne({ email });
		console.log(userOtp);
		if (userOtp !== null) {
			userOtp.otp = otp;
			await userOtp.save();
		} else {
			userOtp = new Verification({ email, otp });
			await userOtp.save();
		}

		res.send("worked");

		// transporter is not created yet;
		// const response = await transporter.sendMail(mailOptions);

		// if (response.messageId) {
		// 	res.status(200).send("OTP Sent To Email. Please Verify it."); //dont modify this statement because frontend sweetalert works on its basis.
		// }
		//  else {
		// 	// console.log("email cannot be sent for OTP and we cant proceed further");
		// 	res.status(500).send("internal Server Error. Please try again later.");
		// }
	} catch (e) {
		res.status(500).send("Internal Server Error. Please try again later.");
	}
}

async function verifyOtp(req, res) {
	try {
		const { email, otp } = req.body;
		// Find the email in the database
		const userOtp = await Verification.findOne({ email });
		// If user's email isn't found or the OTP doesn't match
		if (!userOtp || userOtp.otp != otp) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid OTP" });
		}
		// If everything's fine
		res.status(200).json({ success: true, message: "OTP Verified" });
	} catch (err) {
		res.status(500).json({ success: false, message: "Server error" });
	}
}

module.exports = {
	getUser,
	signUpSuperAdmin,
	resetPassword,
	changeTeamPassword,
	checkUserRoute,
	postUser,
	updateUser,
	deleteUser,
	payNotifications,
	sentOtp,
	verifyOtp,
	LoginUser,
};
