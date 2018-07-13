import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';

import {
  typeDef as AppUser,
  resolvers as AppUserResolvers
} from './schemafiles/AppUserSchema';

import {
  typeDef as Hospital,
  resolvers as HospitalResolvers
} from './schemafiles/HospitalSchema';
import {
  typeDef as Doctor,
  resolvers as DoctorResolvers
} from './schemafiles/DoctorSchema';
import {
  typeDef as Operator,
  resolvers as OperatorResolvers
} from './schemafiles/OperatorSchema';
import {
  typeDef as Patient,
  resolvers as PatientResolvers
} from './schemafiles/PatientSchema';
import {
  typeDef as Batch,
  resolvers as BatchResolvers
} from './schemafiles/BatchSchema';
import {
  typeDef as BatchPatient,
  resolvers as BatchPatientResolvers
} from './schemafiles/BatchPatientSchema';

// merging all resolvers together with the merge function from lodash
const resolvers = merge(
  AppUserResolvers,
  HospitalResolvers,
  DoctorResolvers,
  OperatorResolvers,
  PatientResolvers,
  BatchResolvers,
  BatchPatientResolvers
);

// creating the schema using te typedef and resolvers together
const schema = makeExecutableSchema({
  typeDefs: [AppUser, Hospital, Doctor, Operator, Patient, Batch, BatchPatient],
  resolvers: resolvers
});

export default schema;
