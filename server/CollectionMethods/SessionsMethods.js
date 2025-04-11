import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SessionsCollection } from '../../imports/api/collections';

// Required fields and their type must be included in the insert and update method checks
// TODO: update required checks
Meteor.methods({
    async 'sessions.insert'(data) {
        check(data, Match.ObjectIncluding({
            sessionTitle: String,
            casePresenter: String,
            facilitator: String,
            coordinator: String,
            presentingSpecialist: String,
            participantGroup: String,
            dateTime: Date,
            presentationsDue: Date,
            newMaterial: Boolean,
            color: String,
            topic: String,
            notes: String,
            semester: String,
            series: String
        }));
        
        const sessionsId = await SessionsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        return sessionsId;
    },
    async 'sessions.remove'(sessionsId) {
        check(sessionsId, String);
        return await SessionsCollection.removeAsync(sessionsId);
    },
    async 'sessions.update'(sessionsId, data) {
        check(sessionsId, String);
        check(data, Match.ObjectIncluding({
            sessionTitle: String,
            casePresenter: String,
            facilitator: String,
            coordinator: String,
            presentingSpecialist: String,
            participantGroup: String,
            dateTime: Date,
            presentationsDue: Date,
            newMaterial: Boolean,
            color: String,
            topic: String,
            notes: String,
            semester: String,
            series: String
        }));
        return await SessionsCollection.updateAsync(sessionsId, {
            $set: data
        });
    }
});