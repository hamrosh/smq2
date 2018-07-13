import { gql } from 'apollo-server';
import Operator from '../../models/OperatorModel';

// Type Defs

export const typeDef = gql`
  type Operator {
    id: ID
    operatorName: String
    operatorID: String
    password: String
    operatorType: String
    hospitalID: String
    address: Address
    contact: Contact
    createdDate: Date
    createdBy: String
  }

  extend type Query {
    allOperators: [Operator]
    operatorDoctors: [Doctor]
  }

  extend type Mutation {
    addOperator(input: OperatorInput): Operator
  }

  input OperatorInput {
    operatorName: String!
    operatorID: String!
    password: String!
    operatorType: String
    hospitalID: String
    address: AddressInput
    contact: ContactInput
    createdDate: Date
    createdBy: String
  }
`;

//Writing the resolvers for the queries in the schema file for queries
export const resolvers = {
  Query: {
    allOperators: (root, { input }, context) => {
      if (context.user) {
        console.log(context.user.operatorID);
        console.log(context.user.operatorID);
      }
      return Operator.find();
    },
    operatorDoctors: (root, { input }, context) => {
      console.log(context.user.operatorID);
    }
  },
  Mutation: {
    addOperator: (root, { input }, context) => {
      let q = new Operator(input);
      return q.save();
    }
  }
};
