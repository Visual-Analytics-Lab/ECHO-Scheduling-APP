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
Meteor.publish('participantGroups', function() {
    return ParticipantGroupsCollection.find();
});
Meteor.publish('cohortGroups', function() {
    return CohortGroupsCollection.find();
});
Meteor.publish('topics', function() {
    return TopicsCollection.find();
});