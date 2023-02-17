// import modules
const express = require("express");
const bodyParser = require("body-parser");
const date = require(`${__dirname}/date`);

// initialize variables
const app = express();
const items = ["Buy food", "Cook food", "Eat food"];
const workItems = [];

// set up some overhead
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// default list GET and POST
app.get("/", (req, res) => {
    const day = date.getDate();
    res.render("list", {title: day, items: items});
});

app.post("/", (req, res) => {
    const item = req.body.newItem;

    if (req.body.list === "Work") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});

// work list GET and POST
app.get("/work", (req, res) => {
    res.render("list", {title: "Work List", items: workItems});
});

app.post("/work", (req, res) => {
    workItems.push(req.body.newItem);
    res.redirect("/work");
});

// host the app
app.listen(3000, () => {
    console.log("listening on 3000");
});
