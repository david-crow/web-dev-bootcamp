const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// app setup
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// database setup
mongoose.connect("mongodb://localhost:27017/wikiDB");
const Article = mongoose.model("Article", { title: String, content: String });

// all articles
app.route("/articles")
    .get((req, res) => {
        Article.find(function (err, articles) {
            res.send(err ? err : articles);
        });
    })
    .post((req, res) => {
        const article = new Article({
            title: req.body.title,
            content: req.body.content,
        });

        article.save((err) => {
            res.send(err ? err : "Successfully added a new article.");
        });
    })
    .delete((req, res) => {
        Article.deleteMany((err) => {
            res.send(err ? err : "Successfully deleted all articles.");
        });
    });

// specific articls
app.route("/articles/:articleTitle")
    .get((req, res) => {
        Article.findOne({ title: req.params.articleTitle }, (err, article) => {
            res.send(article ? article : "No article found.");
        });
    })
    .put((req, res) => {
        Article.updateOne(
            { title: req.params.articleTitle },
            { title: req.body.title, content: req.body.content },
            { overwrite: true },
            (err) => {
                if (!err) {
                    res.send("Successfully updated the article.");
                }
            }
        );
    })
    .patch((req, res) => {
        Article.updateOne(
            { title: req.params.articleTitle },
            { $set: req.body },
            (err) => {
                res.send(err ? err : "Successfully updated the article.");
            }
        );
    })
    .delete((req, res) => {
        Article.deleteOne({ title: req.params.articleTitle }, (err) => {
            res.send(err ? err : "Successfully deleted the article.");
        });
    });

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
