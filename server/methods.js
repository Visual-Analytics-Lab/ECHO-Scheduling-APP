import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {
    SpecialistsCollection,
    ParticipantGroupsCollection,
    CohortGroupsCollection,
    TopicsCollection,
} from '../imports/api/collections';

Meteor.methods({
    async 'specialists.insert'(data) {
        console.log('Received data:', data);
        check(data, {
            name: String,
            speciality: String,
            email: String,
            phone: String,
            institute: String
        });
        
        try {
            const specialistId = await SpecialistsCollection.insertAsync({
                ...data,
                createdAt: new Date(),
            });
            console.log('Inserted specialist with ID:', specialistId);
            return specialistId;
        } catch (error) {
            console.error('Error inserting specialist:', error);
            throw new Meteor.Error('insert-failed', 'Failed to insert specialist');
        }
    },
    'specialists.remove'(specialistId) {
        check(specialistId, String);
        return SpecialistsCollection.remove(specialistId);
    },
    'specialists.update'(specialistId, data) {
        check(specialistId, String);
        check(data, {
            name: String,
            speciality: String,
            email: String,
            phone: String,
            institute: String
        });
        return SpecialistsCollection.update(specialistId, {
            $set: data
        });
    }
});