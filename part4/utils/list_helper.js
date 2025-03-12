const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => sum + blog.likes;

  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const mostLikes = (max, blog) => (blog.likes > max.likes ? blog : max);

  return blogs.reduce(mostLikes, blogs[0]);
};

module.exports = { dummy, totalLikes, favoriteBlog };
