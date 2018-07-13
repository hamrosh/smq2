import Doctor from '../../models/DoctorModel';
import Hospital from '../../models/HospitalModel';
import { gql } from 'apollo-server';

// Type Defs

export const typeDef = gql`
  type Department {
    name: String
    description: String
  }

  type Doctor {
    id: ID
    doctorName: String
    hospitalID: [String]
    department: [Department]
    address: Address
    contact: Contact
    createdDate: Date
    createdBy: String
  }
  type DoctorHospitalList {
    doctorID: ID
    doctorName: String
    hospitalID: [String]
    Hospitals: [Hospital]
  }

  extend type Query {
    allDoctors: [Doctor]
    docHosp(id: String): DoctorHospitalList
    hospitalDoctors: [Doctor]
  }

  extend type Mutation {
    addDoctor(input: DoctorInput): Doctor
    setHospital(input: setHospitalInput): Doctor
  }
  input setHospitalInput {
    hospitalID: String
    doctorID: String
  }
  input DepartmentInput {
    name: String
    description: String
  }

  input DoctorInput {
    doctorName: String!
    hospitalID: [String]
    department: [DepartmentInput]
    address: AddressInput
    contact: ContactInput
    createdDate: Date
    createdBy: String
  }
`;

//Writing the resolvers for the queries in the schema file for queries
export const resolvers = {
  Query: {
    allDoctors: () => {
      return Doctor.find();
    },
    docHosp: (root, { id }, context) => {
      return Doctor.findById(id);
    },
    hospitalDoctors: (root, { id }, context) => {
      if (context.user) {
        console.log(context.user.id);
        console.log(context.user.hospitalID);
      }

      return Doctor.find({ hospitalID: context.user.hospitalID });
    }
  },
  DoctorHospitalList: {
    Hospitals: (Doctor, {}, context) => {
      return Hospital.find(
        {
          _id: { $in: Doctor.hospitalID }
        },
        function(err, docs) {
          console.log(docs);
        }
      );
    }
  },
  Mutation: {
    addDoctor: (root, { input }, context) => {
      let q = new Doctor(input);
      return q.save();
    },
    setHospital: (root, { input }, context) => {
      console.log(input);
      return Doctor.findByIdAndUpdate(
        input.doctorID,
        { $push: { hospitalID: input.hospitalID } },
        { new: true },
        function(err, doctor) {
          return doctor;
        }
      );
    }
  }
};
