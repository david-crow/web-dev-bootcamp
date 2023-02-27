// load libraries
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// initialize app
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: "thisissupersecret",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// initialize database
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/userDB");

// define database schema
const userSchema = new mongoose.Schema({ email: String, password: String });
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// define behavior for each route

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        User.register(
            { username: req.body.username },
            req.body.password,
            (err, user) => {
                if (err) {
                    res.redirect("/register");
                } else {
                    passport.authenticate("local")(req, res, () => {
                        res.redirect("/secrets");
                    });
                }
            }
        );
    });

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
        });

        req.login(user, (err) => {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        });
    });

app.get("/logout", (req, res) => {
    req.logout((err) => {
        res.redirect("/");
    });
});

// host the app
app.listen(3000, () => {
    console.log("Server started on port 3000.");
});
