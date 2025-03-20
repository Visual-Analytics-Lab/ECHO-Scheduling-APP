import { Mongo } from 'meteor/mongo';

export const SpecialistsCollection = new Mongo.Collection('specialists');
export const ParticipantGroupsCollection = new Mongo.Collection('participantGroups');
export const SemesterCollection = new Mongo.Collection('semesters');
export const SeriesCollection = new Mongo.Collection('series');
export const TopicsCollection = new Mongo.Collection('topics');
export const SessionsCollection = new Mongo.Collection('sessions');
export const RolesCollection = new Mongo.Collection('roles');