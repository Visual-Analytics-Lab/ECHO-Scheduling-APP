import { Mongo } from 'meteor/mongo';

export const SpecialistsCollection = new Mongo.Collection('specialists');
export const ParticipantGroupsCollection = new Mongo.Collection('participantGroups');
export const CohortGroupsCollection = new Mongo.Collection('cohortGroups');
export const TopicsCollection = new Mongo.Collection('topics');
