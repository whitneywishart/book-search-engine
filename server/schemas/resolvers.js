const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

// define resolver object with mutations and query
const resolvers = {
  // check if user is logged in and if so, determine who
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id })
      }
      throw new AuthenticationError('You are not logged in');
    },
  },


  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      // create the user
      const user = await User.create({ username, email, password });
      
      // immediately sign a JSON Web Token and log the user in after they are created
      const token = signToken(user);
      
      // return auth object that consists of the signed token and user's information
      return { token, user };
    },

    login: async (parent, { email, password }) => {
      // look up user by email
      const user = await User.findOne({ email });

      // inform if no email is found
      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      // confirm password if email is found
      const correctPw = await user.isCorrectPassword(password);

      // inform if password is not correct
      if (!correctPw) {
        throw new AuthenticationError('Password does not match');
      }

      // sign in if credentials are correct
      const token = signToken(user);

      // Return an `Auth` object that consists of the signed token and user's information
      return { token, user };
    },

    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );
        return user;
      }
      throw new AuthenticationError('Please log in!');
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return user;
      }
      throw new AuthenticationError('Please log in!');
    },
  },
};


module.exports = resolvers;