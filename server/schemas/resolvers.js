const {AuthenticationError} = require('apollo-server-express')
const {Book, User} = require('../models');
const {signToken} = require('../utils/auth')

const resolvers = {
    Query: {
        // TODO: me
        me: async (_, _, context) => {
            if (context.user) {
                return User.findOne({_id: context.user._id});
            }
            throw new AuthenticationError('You need to be logged in!')
        }
    },
    Mutation: {
        login: async (_, {email, password}) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenticationError('No Profile found! Check that your email or password is correct.')
            }

            const correctPw = await user.iscorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('No Profile found! Check that your email or password is correct.')
            }

            const token = signToken(user);
            return {token, user};
        },
        addUser: async (_, {username, email, password}) => {
            const user = await User.create({username, email, password});
            const token = signToken(user);

            return {token, user};
        },
        saveBook: async (_, {userId, newBook}, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    {_id: userId},
                    {
                        $addToSet: {
                            savedBooks: newBook
                        }
                    }, 
                    {
                        new: true,
                        runValidators: true
                    }

                )
            }
        }, 
        removeBook: async (_, { userId, bookId}, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    {_id: userId},
                    {
                        $pull: {
                           savedBooks: {bookId: bookId} 
                        }
                    }, 
                    {
                        new: true
                    }
                )
            }
        }
    }
}