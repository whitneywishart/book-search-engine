const { User } = require('../models');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        // Get and return the user document based on the user ID in the context
        return await User.findOne({ _id: context.user._id });
      }
      throw new Error('Not logged in');
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      // Login
    },
    addUser: async (parent, { username, email, password }) => {
      // Add user
    },
    saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
      if (context.user) {
        // Get the logged-in user ID
        const { _id } = context.user;

        // Create new book
        const newBook = {
          authors,
          description,
          title,
          bookId,
          image,
          link,
        };

        // Add new book to user
        return await User.findOneAndUpdate(
          { _id },
          { $push: { savedBooks: newBook } },
          { new: true }
        );
      }
      throw new Error('Please log in to save a book');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        // Get user
        const { _id } = context.user;

        // Update user
        return await User.findOneAndUpdate(
          { _id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      throw new Error('Please log in to remove a book');
    },
  },
};

module.exports = resolvers;
