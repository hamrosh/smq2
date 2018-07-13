import AppUser from '../../models/AppUserModel';
import { gql } from 'apollo-server';
import 'babel-polyfill';
// Type Defs

export const typeDef = gql`
  type AppUser {
    id: ID
    fullName: String
    emailid: String
    password: String
    mobileNumber: String
    createdDate: String
  }
  type ReturnMessage {
    message: String
  }
  type Query {
    UserExists(emailid: String, password: String): ReturnMessage
  }

  type Mutation {
    addAppUser(input: AppUserInput): AppUser
    activateUser(id: ID!): AppUser
  }

  input AppUserInput {
    fullname: String
    emailid: String
    password: String
    mobileNumber: String
  }
`;

//Writing the resolvers for the queries in the schema file for queries
export const resolvers = {
  Query: {
    UserExists: async (root, { emailid, password }, context) => {
      var ex = false;
      await AppUser.findOne({ emailid: emailid }, (err, user) => {
        ex = user.checkPassword(password);
      });
      if (ex) {
        return { message: 'User Exists' };
      } else {
        return { message: 'Not Found' };
      }
    }
  },
  Mutation: {
    addAppUser: (root, { input }, context) => {
      console.log(input);
      let user = new AppUser(input);
      return user.save();
    },
    activateUser: async (root, { id }, context) => {
      var ex;
      return AppUser.findByIdAndUpdate(
        id,
        { $set: { active: true } },
        { new: true },
        function(err, user) {
          if (err) return handleError(err);
          return user;
        }
      );
    }
  }
};
