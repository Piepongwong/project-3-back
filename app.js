const cors = require("cors");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require('express-session')
const mongoose = require('mongoose');
require("dotenv").config();

var sessionOptions = {
    secret: process.env.SESSION_SECRET,
    cookie: {}
}
app.use(session(sessionOptions));

function auth(req, res, next) {
    console.log('CURRENT USER', req.session.currentUser)
    if (req.session.currentUser) {
        next()
    } else {
        res.json({ message: "Not logged in on back-end" })
    }
}


let options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose
    .connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(x => {
        console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
    })
    .catch(err => {
        console.error('Error connecting to mongo', err)
    });


app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.use(
    cors({
        allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
        exposedHeaders: ["authorization"], // you can change the headers
        origin: [process.env.client_origin_a, process.env.client_origin_b],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        credentials: true
    })
);



app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/index"));
app.use("/", require("./routes/wod"));
app.use("/", require("./routes/user"));

app.use((err, req, res, next) => {
    res.status(err.status)
    res.json({
        error: err.message
    })
})

module.exports = app;