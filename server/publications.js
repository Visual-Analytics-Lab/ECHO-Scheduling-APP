import { Meteor } from 'meteor/meteor'
import {
    SpecialistsCollection,
    ParticipantGroupsCollection,
    SemesterCollection,
    SeriesCollection,
    SessionsCollection,
} from '../imports/api/collections';

Meteor.publish('users', async function () {
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (currentUser) {
      return Meteor.users.find({}, {
        fields: {
          username: 1,
          emails: 1,
          createdAt: 1,
        }
      });
    }
    return this.ready();
  });
  
Meteor.publish('specialists', function () {
    return SpecialistsCollection.find();
});
Meteor.publish('participantGroups', function() {
    return ParticipantGroupsCollection.find();
});
Meteor.publish('semesters', function() {
    return SemesterCollection.find();
});
Meteor.publish('series', function() {
    return SeriesCollection.find();
});
Meteor.publish('topics', function() {
    return TopicsCollection.find();
});
Meteor.publish('sessions', function() {
  return SessionsCollection.find();
});