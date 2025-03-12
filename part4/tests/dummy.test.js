const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");

// Just to learn more about tests
test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  assert.strictEqual(result, 1);
});

// Test for total likes in all blogs
describe("total likes", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
      likes: 5,
      __v: 0,
    },
  ];

  test("when a list only has one blog, the likes equals that blogs likes", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    assert.strictEqual(result, 5);
  });
});

describe("Which blog...", () => {
  const blogs = [
    {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12,
    },
    {
      title: "The theory of everything",
      author: "Juicy J",
      likes: 1200,
    },
  ];

  test("has the most likes", () => {
    const result = listHelper.favoriteBlog(blogs);
    const expected = {
      title: "The theory of everything",
      author: "Juicy J",
      likes: 1200,
    };

    assert.deepStrictEqual(result, expected);
  });
});
