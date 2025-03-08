const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("body", (request) => JSON.stringify(request.body));

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

let phonebookEntries = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(phonebookEntries);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = phonebookEntries.find((person) => person.id === id);

  if (person) response.json(person);
  else response.status(404).end();
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = phonebookEntries.find((person) => person.id === id);

  if (!person) response.status(404).end();
  else {
    phonebookEntries = phonebookEntries.filter((person) => person.id !== id);
    response.status(204).end();
  }
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

  const person = {
    name: body.name,
    number: body.number,
    id: String(id),
  };

  phonebookEntries = phonebookEntries.concat(person);

  response.json(person);
});

app.get("/info", (request, response) => {
  response.send(`
        <p>Phonebook has info for ${phonebookEntries.length} people</p>
        <p>${Date()}</p>
    `);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
