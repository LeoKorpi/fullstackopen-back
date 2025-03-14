const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", { title: 1, auhtor: 1, url: 1, likes: 1 });
  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if (!username || !password) {
    console.log("no username or password");
    return response.status(400).json({ error: "Username and password are required" });
  }

  if (username.length < 3 || password.length < 3) {
    console.log("username or password not long enough");
    return response
      .status(400)
      .json({ error: "Username and password must be atleast 3 characters long" });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    console.log("user already exists");
    return response.status(400).json({ error: "Username must be unique" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.delete("/:id", async (request, response) => {
  await User.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

module.exports = usersRouter;
