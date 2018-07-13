import { gql } from 'apollo-server';
const { withFilter } = require('apollo-server');
import BatchPatient from '../../models/BatchPatientModel';
import Batch from '../../models/BatchModel';
import Patient from '../../models/PatientModel';

import { PubSub } from 'graphql-subscriptions';
export const pubsub = new PubSub();

// Type Defs
function insertAndShift(arr, from, to) {
  let cutOut = arr.splice(from, 1)[0]; // cut the element at index 'from'
  arr.splice(to, 0, cutOut); // insert it at index 'to'
}

export const typeDef = gql`
  type BatchPatient {
    id: ID
    batchID: String
    patientID: String
    patientNumber: String
    sequenceNumber: Int
    pushedTimes: Int
    currentStatus: String
    statusHistory: [StatusHistorySchema]
    totalTimeWithDoctor: String
    createdDate: Date
    operatorID: String
    batchInfo: Batch
    patientInfo: Patient
  }
  type PatientStatus {
    patientID: String
    batchID: String
    patientNumber: String
    currentStatus: String
    DisplayMessage: String
  }
  extend type Subscription {
    patientStatusChanged(batchID: String): PatientStatus
  }
  extend type Query {
    batchCompletedPatients(batchID: String): [BatchPatient]
    batchRemainingPatients(batchID: String): [BatchPatient]
    batchCancelledPatients(batchID: String): [BatchPatient]
  }

  extend type Mutation {
    addBatchPatients(input: BatchPatientInput): BatchPatient
    cancelBatchPatient(batchpatientID: String): BatchPatient
    startBatchPatient(batchpatientID: String): BatchPatient
    completeBatchPatient(batchpatientID: String): BatchPatient
    assignSequenceNumber(batchID: String): ReturnMessage
    pushBatchSequence(batchID: String, batchpatientID: String): ReturnMessage
  }
  input BatchPatientInput {
    batchID: String!
    patientID: String!
    patientNumber: String
    sequenceNumber: Int
    pushedTimes: Int
    currentStatus: String
    statusHistory: [StatusHistoryInput]
    totalTimeWithDoctor: String
    createdDate: Date
    operatorID: String
    batchSequence: [String]
  }
`;

//Writing the resolvers for the queries in the schema file for queries
export const resolvers = {
  Query: {
    batchCompletedPatients: async (root, { batchID }, context) => {
      // return BatchPatient.aggregate([
      //   { $match: { batchID: batchID, 'statusHistory.status': 'Completed' } },
      //   { $sort: { 'statusHistory.setOn': -1 } }
      // ]);

      return await BatchPatient.find({
        $and: [{ batchID: batchID }, { 'statusHistory.status': 'Completed' }]
      }).sort({ 'statusHistory.setOn': -1 });
    },
    batchRemainingPatients: async (root, { batchID }, context) => {
      return BatchPatient.find({
        $and: [
          { batchID: batchID },
          {
            'statusHistory.status': {
              $not: { $in: ['Completed', 'Cancelled'] }
            }
          }
        ]
      }).sort({ sequenceNumber: 1 });

      // return BatchPatient.aggregate([
      //   {
      //     $match: {
      //       batchID: batchID,
      //       'statusHistory.status': {
      //         $not: { $in: ['Completed', 'Cancelled'] }
      //       }
      //     }
      //   },
      //   { $sort: { sequenceNumber: 1 } }
      // ]);
    },
    batchCancelledPatients: async (root, { batchID }, context) => {
      return await BatchPatient.find({
        $and: [{ batchID: batchID }, { 'statusHistory.status': 'Cancelled' }]
      }).sort({ 'statusHistory.setOn': -1 });
      // return BatchPatient.aggregate([
      //   { $match: { batchID: batchID, 'statusHistory.status': 'Cancelled' } },
      //   { $sort: { 'statusHistory.setOn': -1 } }
      // ]);
    }
  },
  Mutation: {
    addBatchPatients: (root, { input }, context) => {
      return new Promise((resolve, reject) => {
        try {
          BatchPatient.countDocuments(
            { batchID: input.batchID },
            async (err, count) => {
              if (err) {
                reject(err);
                return;
              }
              input.patientNumber = 'P-' + (count + 1);
              input.currentStatus = 'Created';
              const d = await BatchPatient.create(input).catch(err => {
                reject(err);
                return;
              });
              console.log(d);
              await Batch.findByIdAndUpdate(input.batchID, {
                $push: { batchSequence: d.id }
              });
              resolve(d);
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    },
    cancelBatchPatient: async (root, { batchpatientID }, context) => {
      const bp = await BatchPatient.findOneAndUpdate(
        { _id: batchpatientID },
        {
          $push: {
            statusHistory: {
              status: 'Cancelled',
              setOn: new Date().toISOString()
            }
          },
          $set: { currentStatus: 'Cancelled' }
        }
      );

      await Batch.findByIdAndUpdate(bp.batchID, {
        $pull: { batchSequence: bp.id }
      });
      return bp;
    },
    startBatchPatient: async (root, { batchpatientID }, context) => {
      const bp = await BatchPatient.findOneAndUpdate(
        { _id: batchpatientID },
        {
          $push: {
            statusHistory: {
              status: 'Started',
              setOn: new Date().toISOString()
            }
          },
          $set: { currentStatus: 'Started' }
        }
      );

      await pubsub.publish('PATIENT_STATUS_CHANGED', {
        patientStatusChanged: {
          patientID: bp.patientID,
          batchID: bp.batchID,
          patientNumber: bp.patientNumber,
          currentStatus: 'STARTED',
          DisplayMessage: 'Patient has Started Now'
        }
      });

      return bp;
    },
    completeBatchPatient: async (root, { batchpatientID }, context) => {
      const bp = await BatchPatient.findOneAndUpdate(
        { _id: batchpatientID },
        {
          $push: {
            statusHistory: {
              status: 'Completed',
              setOn: new Date().toISOString()
            }
          },
          $set: { currentStatus: 'Completed' }
        }
      );

      await pubsub.publish('PATIENT_STATUS_CHANGED', {
        patientStatusChanged: {
          patientID: bp.patientID,
          batchID: bp.batchID,
          patientNumber: bp.patientNumber,
          currentStatus: 'COMPLETED',
          DisplayMessage: 'Patient has Completed'
        }
      });
      await Batch.findByIdAndUpdate(bp.batchID, {
        $pull: { batchSequence: bp.id },
        $inc: { totalCompletedPatients: 1 }
      });
      return bp;
    },
    pushBatchSequence: async (root, { batchID, batchpatientID }, context) => {
      const x = await Batch.findOne({ _id: batchID }, 'batchSequence', function(
        err,
        batch
      ) {
        if (err) return handleError(err);
        let seqArray = batch.batchSequence;
        let index = seqArray.indexOf(batchpatientID);
        if (seqArray.length - 1 - index >= 3) {
          insertAndShift(seqArray, index, index + 3);
        } else {
          insertAndShift(seqArray, index, index + 1);
        }
        batch.batchSequence = seqArray;
        batch.save();
      });
      return { message: 'done' };
    }
  },
  Subscription: {
    patientStatusChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('PATIENT_STATUS_CHANGED'),
        (payload, variables) => {
          return payload.patientStatusChanged.batchID === variables.batchID;
        }
      )
    }
  },
  BatchPatient: {
    batchInfo: async (bp, {}, context) => {
      return await Batch.findById(bp.batchID);
    },
    patientInfo: async (bp, {}, context) => {
      return await Patient.findById(bp.patientID);
    }
  }
};
