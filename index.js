require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const Person = require("./models/person");

let phonebookEntries = [];

const requestLogger = (req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Body:", req.body);
  next();
};

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(requestLogger);

const unknownEndpoints = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id).then((result) => {
    if (result) response.status(204).end();
    else response.status(404).json({ error: "Person not found" });
  });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const id = Math.floor(Math.random() * 100000);
  const exists = phonebookEntries.some((person) => person.name === body.name);

  if (!body.name) {
    return response.status(400).json({
      error: "name is missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number is missing",
    });
  }

  if (exists) {
    return response.status(409).json({
      error: "name must be unique",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: String(id),
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.use(unknownEndpoints);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
