import { Meteor } from 'meteor/meteor'
import {
    SpecialistsCollection,
    ParticipantGroupsCollection,
    CohortGroupsCollection,
    TopicsCollection,
} from '../imports/api/collections';

Meteor.publish('specialists', function () {
    return SpecialistsCollection.find();
});