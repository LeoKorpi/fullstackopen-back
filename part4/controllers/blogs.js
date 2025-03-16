const blogsRouter = require("express").Router();
const middleware = require("../utils/middleware");
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1, id: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) response.json(blog);
  else response.status(404).end();
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user.id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", middleware.userExtractor, async (request, response, next) => {
  try {
    const user = request.user;
    const blog = await Blog.findById(request.params.id);

    if (!blog) return response.status(404).json({ error: "blog not found" });

    console.log("Blog user: ", blog);
    console.log("Blog user id: ", blog.user);
    console.log("Requset user id : ", user.id);

    if (blog.user.toString() !== user.id.toString())
      return response.status(403).json({ error: "not authorized to delete this" });

    console.log("attempting to delete blog with id: ", request.params.id);
    const deletedBlog = await Blog.findByIdAndDelete(request.params.id);
    console.log("Deleted blog: ", deletedBlog);

    response.status(204).end();
  } catch (error) {
    console.error("DELETE error", error);
    next(error);
  }
});

blogsRouter.put("/:id", async (request, response) => {
  const blog = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
    runValidators: true,
  });

  if (!updatedBlog) return response.status(404).json({ error: "Blog not found" });
  response.json(updatedBlog);
});

module.exports = blogsRouter;
