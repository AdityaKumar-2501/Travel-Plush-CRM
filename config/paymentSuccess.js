const { Transaction, User } = require("../models/user");

const paymentSuccess = (req, res) => {
    //console.log("we are in the payment success block and checking whats in the body", req.body)
    const {
        status,
        email,
        firstname,
        productinfo,
        amount,
        txnid,
        key,
        hash,
        phone,
    } = req.body;
    const newTransaction = new Transaction({
        status,
        email,
        firstname,
        productinfo,
        amount,
        txnid,
        key,
        hash,
        phone,
    });
    const currentDate = new Date();

    // Extract day, month, and year from the current date
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Months are zero-based, so adding 1 to get the correct month
    const year = currentDate.getFullYear();

    // Format day, month, and year to DD-MM-YYYY format
    const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;

    newTransaction
        .save()
        .then(async () => {
            //console.log("Transaction saved1111");
            const foundUser = await User.findOne({ email })
            if (!foundUser) return res.status(400).send("please enter correct email ID!")
            const allUsers = await User.find({ orgName: foundUser.orgName })
            for (const user of allUsers) {
                await User.findOneAndUpdate(
                    { email: user.email },
                    { $set: { demo: false, paidDateCreated: formattedDate } }
                )
                    .then(() => {
                        //console.log('User premium status updated successfully');
                    })
                    .catch((err) => {
                        //console.log(err.message);
                        return res.status(500).send(`error - ${err.message}`)
                    });
            }
        })
        .catch((error) => {
            //console.log("Error saving transaction", error);
            return res.status(500).send(`error - ${err.message}`)
        });


    //console.log("we are just above res.redirect")
    res.redirect("https://ocpl.tech/response/success");
}

module.exports = paymentSuccess