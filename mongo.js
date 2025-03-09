const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://leokorpi:${password}@cluster0.kbz9n.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (!name & !number) {
  Person.find({}).then((people) => {
    console.log("Phonebook: ");
    people.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else {
  const person = new Person({
    id: String(Math.floor(Math.random() * 100000)),
    name: name,
    number: number,
  });

  person.save().then((result) => {
    console.log("person added to phonebook!", result);
    mongoose.connection.close();
  });
}
