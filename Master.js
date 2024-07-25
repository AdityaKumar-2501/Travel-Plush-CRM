const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))

const db = require("./config/db.js")
const MiddleWares = require("./config/extra.js")
const indexRouter = require("./routes/index.js")


app.use("/" , indexRouter)



MiddleWares(app)
db()
app.listen(process.env.port, () => {
    console.log(`${process.env.port} port is running`)
})

