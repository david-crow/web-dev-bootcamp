// load libraries
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

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
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

// initialize authentication
passport.use(User.createStrategy());
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/secrets",
        },
        (accessToken, refreshToken, profile, cb) => {
            User.findOrCreate({ googleId: profile.id }, (err, user) => {
                return cb(err, user);
            });
        }
    )
);

// define behavior for each route

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secrets", (req, res) => {
    User.find({ secret: { $ne: null } }, (err, users) => {
        if (users) {
            res.render("secrets", { users: users });
        }
    });
});

app.route("/submit")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render("submit");
        } else {
            res.redirect("/login");
        }
    })
    .post((req, res) => {
        User.findById(req.user.id, (err, user) => {
            if (user) {
                user.secret = req.body.secret;
                user.save(() => {
                    res.redirect("/secrets");
                });
            }
        });
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

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
);

app.get(
    "/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/secrets");
    }
);

app.get("/logout", (req, res) => {
    req.logout((err) => {
        res.redirect("/");
    });
});

// host the app
app.listen(3000, () => {
    console.log("Server started on port 3000.");
});
