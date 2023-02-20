// import modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// initialize variables
const app = express();
const dbWaitMS = 0;

// initialize app overhead
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// initialize database
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/taskListDB");
const itemSchema = { name: String };
const listSchema = { name: String, items: [itemSchema] };
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);
const defaultItems = [
    new Item({ name: "Welcome to your Task List!" }),
    new Item({ name: "Click the + button to add a new task" }),
    new Item({ name: "Click the checkbox to delete a task" })
];

// homepage
app.get("/", (req, res) => {
    Item.find({}, (_, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                console.log(err ? err : "Successfully added default items!");
            });

            redirect(res, "/");
        } else {
            res.render("list", { title: "Today", items: foundItems });
        };
    });
});

// custom pages
app.get("/:customList", (req, res) => {
    const customList = _.capitalize(req.params.customList);
    List.findOne({ name: customList }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                new List({ name: req.params.customList, items: defaultItems }).save();
                redirect(res, `/${customList}`);
            } else {
                res.render("list", { title: foundList.name, items: foundList.items });
            };
        };
    });
});

// add items
app.post("/", (req, res) => {
    const item = new Item({ name: req.body.newItem });
    const listName = req.body.list;

    if (listName === "Today") {
        item.save();
        redirect(res, "/");
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            redirect(res, `/${listName}`);
        });
    };
});

// delete items
app.post("/delete", (req, res) => {
    const itemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(itemId, (err) => {
            if (!err) {
                console.log(err ? err : "Successfully deleted checked item.");
                redirect(res, "/");
            };
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: itemId } } }, (err, foundList) => {
            if (!err) {
                redirect(res, `/${listName}`);
            };
        });
    };
});

// host the app
app.listen(3000, () => {
    console.log("listening on 3000");
});

// sometimes, the DB doesn't update before the redirect...
const redirect = (res, loc) => {
    setTimeout(() => {
        res.redirect(loc);
    }, dbWaitMS);
};
