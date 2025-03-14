const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test("the frist blog is about cooking as a student", async () => {
  const response = await api.get("/api/blogs");

  const contents = response.body.map((blog) => blog.title);
  assert(contents.includes("The student's kitchen"));
});

describe("viewing a specific blog", () => {
  test("the unique identifier is named id, not _id", async () => {
    const response = await api.get("/api/blogs");

    assert("id" in response.body[0], "the blog should have an 'id' property");
    assert(!("_id" in response.body[0]), "the blog should NOT have an '_id' property");
  });
});

describe("Addition of a new blog", () => {
  test("a POST request successfully add a new blog to the db", async () => {
    const newBlog = {
      title: "Blog title",
      author: "Name nameson",
      url: "www.blog.com",
      likes: 4,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const contents = response.body.map((r) => r.title);

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1);
    assert(contents.includes("Blog title"));
  });

  test("if likes property is missing, it defaults to 0", async () => {
    const newBlog = {
      title: "Nobody likes me...",
      author: "Samuel sad",
      url: "www.nolikes.com",
      // likes is intentionally not included
    };

    const response = await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.likes, 0, "Expected default likes to be 0");
  });

  test("if title is missing, backend should respond with code 400", async () => {
    const newBlog = {
      author: "The person who forgets title and url to their",
      url: "www.notitle.com",
      likes: 3,
      // Title are intentionally left out
    };

    const response = await api.post("/api/blogs").send(newBlog).expect(400);

    assert.strictEqual(
      response.body.error,
      "Blog validation failed: title: Path `title` is required."
    );
  });

  test("if url is missing, backend should respond with code 400", async () => {
    const newBlog = {
      title: "Url missing",
      author: "The person who forgets title and url to their",
      likes: 6,
      // Url is intentionally left out
    };

    const response = await api.post("/api/blogs").send(newBlog).expect(400);

    assert.strictEqual(response.body.error, "Blog validation failed: url: Path `url` is required.");
  });
});

describe("Deletion of a blog", () => {
  test("succeeds with code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

    const titles = blogsAtEnd.map((r) => r.title);
    assert(!titles.includes(blogToDelete.title));
  });
});

describe("Updating value of a specific blog", () => {
  test("updating the likes", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedBlogData = {
      likes: blogToUpdate.likes + 1,
    };

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlogData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1);

    const updatedBlogInDb = await Blog.findById(blogToUpdate.id);
    assert.strictEqual(updatedBlogInDb.likes, blogToUpdate.likes + 1);
  });
});

describe("When there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "l_korpi",
      name: "Leo Korpi",
      password: "k0rp1k0rp1",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with a proper statuscode and message if username is already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "k0rp1k0rp1",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.error.includes("Username must be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
