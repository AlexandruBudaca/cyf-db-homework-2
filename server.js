const dotenv = require("dotenv");
const express = require("express");
const mongodb = require("mongodb");

const { getPutBodyIsAllowed } = require("./util");

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = process.env.DATABASE_URI;

app.post("/api/books", function (request, response) {
  const client = new mongodb.MongoClient(uri);

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const {
      title,
      author,
      author_birth_year,
      author_death_year,
      url,
    } = request.query;

    const book = {};
    if (request.query.title) {
      book["title"] = title;
    } else {
      response.sendStatus(400);
    }
    if (request.query.author) {
      book["author"] = author;
    } else {
      response.sendStatus(400);
    }
    if (request.query.author_birth_year) {
      book["author_birth_year"] = Number(author_birth_year);
    } else {
      response.sendStatus(400);
    }
    if (request.query.author_death_year) {
      book["author_death_year"] = Number(author_death_year);
    } else {
      response.sendStatus(400);
    }
    if (request.query.url) {
      book["url"] = url;
    } else {
      response.sendStatus(400);
    }

    collection.insertOne(book, (error, book) => {
      response.send(error || book);
      client.close();
    });
  });
});

app.delete("/api/books/:id", function (request, response) {
  // Make this work, too!
  const client = new mongodb.MongoClient(uri);

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");
    let id;
    try {
      id = new mongodb.ObjectID(request.params.id);
    } catch (error) {
      response.sendStatus(400);
      return;
    }

    const searchObject = { _id: id };

    collection.deleteOne(searchObject, function (error, book) {
      if (error) {
        response.sendStatus(400);
      }
      if (book.deletedCount === 0) {
        response.sendStatus(400);
      } else {
        response.send({ message: "Book deleted successfully!" });
      }

      client.close();
    });
  });
});

app.put("/api/books/:id", function (request, response) {
  // Also make this work!
  const client = new mongodb.MongoClient(uri);
  let id;
  try {
    id = new mongodb.ObjectID(request.params.id);
  } catch (error) {
    response.sendStatus(400);
    return;
  }
  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const searchObject = { _id: id };

    const {
      title,
      author,
      author_birth_year,
      author_death_year,
      url,
    } = request.body;

    const updateObject = {
      $set: {
        title: title,
        author: author,
        author_birth_year: Number(author_birth_year),
        author_death_year: Number(author_death_year),
        url: url,
      },
    };

    const options = { returnOriginal: false };

    collection.findOneAndUpdate(searchObject, updateObject, options, function (
      error,
      result
    ) {
      if (!updateObject) {
        response.sendStatus(422);
      }
      console.log(searchObject);
      response.send(error || result.value || 404);
      client.close();
    });
  });
});

app.get("/api/books", function (request, response) {
  const client = new mongodb.MongoClient(uri);

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const searchObject = {};

    if (request.query.title) {
      searchObject.title = request.query.title;
    }

    if (request.query.author) {
      searchObject.author = request.query.author;
    }

    collection.find(searchObject).toArray(function (error, books) {
      response.send(error || books);
      client.close();
    });
  });
});

app.get("/api/books/:id", function (request, response) {
  const client = new mongodb.MongoClient(uri);

  let id;
  try {
    id = new mongodb.ObjectID(request.params.id);
  } catch (error) {
    response.sendStatus(400);
    return;
  }

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const searchObject = { _id: id };

    collection.findOne(searchObject, function (error, book) {
      if (!book) {
        response.sendStatus(404);
      } else {
        response.send(error || book);
      }

      client.close();
    });
  });
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.get("/books/new", function (request, response) {
  response.sendFile(__dirname + "/new-book.html");
});

app.get("/books/:id", function (request, response) {
  response.sendFile(__dirname + "/book.html");
});

app.get("/books/:id/edit", function (request, response) {
  response.sendFile(__dirname + "/edit-book.html");
});

app.get("/authors/:name", function (request, response) {
  response.sendFile(__dirname + "/author.html");
});

app.listen(port || 5000, function () {
  console.log(`Running at \`http://localhost:${port}\`...`);
});
