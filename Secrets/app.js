// load libraries
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// initialize app
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// initialize database
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/userDB");

// define database schema
const userSchema = new mongoose.Schema({ email: String, password: String });
const User = new mongoose.model("User", userSchema);

// define behavior for each route

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({ email: username }, (err, foundUser) => {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, (err, result) => {
                    if (result) {
                        res.render("secrets");
                    }
                });
            }
        });
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            const user = new User({
                email: req.body.username,
                password: hash,
            });

            user.save((err) => {
                res.render("secrets");
            });
        });
    });

app.get("/logout", (req, res) => {
    res.redirect("/");
});

// host the app
app.listen(3000, () => {
    console.log("Server started on port 3000.");
});
