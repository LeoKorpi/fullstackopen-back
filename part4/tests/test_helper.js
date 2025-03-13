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

module.exports = { initialBlogs };
