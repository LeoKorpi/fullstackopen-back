const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = async () => {
  const user = await User.findOne({ username: "testuser" });
  if (!user) throw new Error("Test user now found. Ensure that test setup creates a user");

  return [
    {
      title: "The best blog in the world",
      author: "Myself",
      url: "www.bestblog.com",
      likes: 5,
      user: user._id,
    },
    {
      title: "The student's kitchen",
      author: "Elsa Vancleef",
      url: "www.Easycooking.com",
      likes: 13,
      user: user._id,
    },
    {
      title: "The student's kitchen",
      author: "Elsa Vancleef",
      url: "www.Easycooking.com",
      likes: 12,
      user: user._id,
    },
  ];
};

const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon" });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = { initialBlogs, nonExistingId, blogsInDb, usersInDb };
