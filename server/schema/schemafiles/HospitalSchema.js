import Hospital from '../../models/HospitalModel';
import { gql } from 'apollo-server';

// Type Defs

export const typeDef = gql`
  scalar Date

  type Address {
    address: String
    landmark: String
    city: String
    state: String
    pincode: String
  }
  type Contact {
    contactName: String
    mobile1: String
    mobile2: String
    address: Address
  }
  type Hospital {
    id: ID
    hospitalName: String
    address: Address
    contacts: [Contact]
    createdBy: String
  }

  extend type Query {
    allHospitals: [Hospital]
  }

  extend type Mutation {
    addHospital(input: HospitalInput): Hospital
  }

  input AddressInput {
    address: String
    landmark: String
    city: String
    state: String
    pincode: String
  }
  input ContactInput {
    contactName: String
    mobile1: String
    mobile2: String
    address: AddressInput
  }
  input HospitalInput {
    hospitalName: String
    address: AddressInput
    contacts: [ContactInput]
    createdBy: String
  }
`;

//Writing the resolvers for the queries in the schema file for queries
export const resolvers = {
  Query: {
    allHospitals: () => {
      return Hospital.find();
    }
  },
  Mutation: {
    addHospital: (root, { input }, context) => {
      let q = new Hospital(input);
      return q.save();
    }
  }
};
