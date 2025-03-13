const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
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

test("the unique identifier is named id, not _id", async () => {
  const response = await api.get("/api/blogs");

  assert("id" in response.body[0], "the blog should have an 'id' property");
  assert(!("_id" in response.body[0]), "the blog should NOT have an '_id' property");
});

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

after(async () => {
  await mongoose.connection.close();
});
