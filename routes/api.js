/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const mongoose = require("mongoose");
const express = require("express");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    comments: { type: [String], default: [] },
    commentcount: { type: Number, default: 0 },
  },
  { versionKey: false }
);
const Book = mongoose.model("Book", BookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      Book.find()
        .select({ comments: 0 })
        .exec((err, books) => {
          if (err) return res.json({ error: "failed to get books" });
          if (!books) return res.send("no book exists");
          res.json(books);
        });
    })

    .post(express.urlencoded({ extended: false }), function (req, res) {
      let title = req.body.title;
      let newBook = new Book({ title });
      if (!title) return res.send("missing required field title");
      newBook.save((err, book) => {
        if (err || !book) res.json({ error: "failed to save book" });
        res.json({ _id: book._id, title: book.title });
      });
      //response will contain new book object including atleast _id and title
    })

    .delete(function (req, res) {
      Book.deleteMany({}, (err, data) => {
        if (err) return res.json({ error: "failed to delete books" });
        res.send("complete delete successful");
      });
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      Book.findById(bookid)
        .select({ commentcount: 0 })
        .exec((err, book) => {
          if (err) return res.json({ error: "failed to get book" });
          if (!book) return res.send("no book exists");
          res.json(book);
        });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(express.urlencoded({ extended: false }), function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) return res.send("missing required field comment");
      Book.findById(bookid, (err, book) => {
        if (err) return res.json({ error: "failed to find book" });
        if (!book) return res.send("no book exists");
        book.comments.push(comment);
        ++book.commentcount;
        book.save((err, data) => {
          if (err) res.json({ error: "failed to update book" });
          res.json({
            _id: data._id,
            title: data.title,
            comments: data.comments,
          });
        });
      });
      //json res format same as .get
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      Book.findByIdAndRemove(bookid, (err, book) => {
        if (err) return { error: "failed to get book" };
        if (!book) return res.send("no book exists");
        res.send("delete successful");
      });
      //if successful response will be 'delete successful'
    });
};
