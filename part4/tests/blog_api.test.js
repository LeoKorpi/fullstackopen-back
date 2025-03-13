const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "The best blog in the world",
    author: "Myself",
    url: "www.bestblog.com",
    likes: 5,
    id: "67d1959d3087ebff4e822315",
  },
  {
    title: "I HATE BLOGS!!!",
    author: "Hater",
    url: "www.thisblogsux.com",
    likes: 0,
    id: "67d2c190c31211d763a7056a",
  },
  {
    title: "The student's kitchen",
    author: "Elsa Vancleef",
    url: "www.Easycooking.com",
    likes: 12,
    id: "67d2c1e96ef12e170f540475",
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();

  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();

  blogObject = new Blog(initialBlogs[2]);
  await blogObject.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there are three blogs", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, 3);
});

test("the frist blog is about cooking as a student", async () => {
  const response = await api.get("/api/blogs");

  const contents = response.body.map((blog) => blog.title);
  assert(contents.includes("The student's kitchen"));
});

after(async () => {
  await mongoose.connection.close();
});
