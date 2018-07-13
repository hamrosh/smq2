import { gql } from 'apollo-server';
import Batch from '../../models/BatchModel';

// Type Defs

export const typeDef = gql`
  type StatusHistorySchema {
    status: String
    setOn: Date
    setBy: String
  }
  type Batch {
    id: ID
    hospitalID: String
    doctorID: String
    batchName: String
    batchDate: Date
    startTime: String
    endTime: String
    isBookingOpen: Boolean
    statusHistory: [StatusHistorySchema]
    cancellationReason: String
    createdDate: Date
    operatorID: String
    batchDateString: String
    batchSequence: [String]
    totalCompletedPatients: Int
  }

  extend type Query {
    allBatches: [Batch]
    batchByDate(batchByDate: String): [Batch]
  }

  extend type Mutation {
    addBatch(input: BatchInput): Batch
  }

  input StatusHistoryInput {
    status: String
    setOn: Date
    setBy: String
  }

  input BatchInput {
    hospitalID: String
    doctorID: String!
    batchName: String
    batchDate: Date
    startTime: String
    endTime: String
    isBookingOpen: Boolean
    statusHistory: [StatusHistoryInput]
    cancellationReason: String
    createdDate: Date
    operatorID: String
    batchDateString: String
  }
`;

//Writing the resolvers for the queries in the schema file for queries
export const resolvers = {
  Query: {
    allBatches: () => {
      return Batch.find();
    },
    batchByDate: (root, { batchByDate }, context) => {
      if (context.user) {
        return Batch.find({
          batchDateString: batchByDate,
          operatorID: context.user.id,
          hospitalID: context.user.hospitalID
        });
      }
    }
  },
  Mutation: {
    addBatch: (root, { input }, context) => {
      if (context.user) {
        input.operatorID = context.user.id;
        input.hospitalID = context.user.hospitalID;
      }

      let q = new Batch(input);
      return q.save();
    }
  }
};
