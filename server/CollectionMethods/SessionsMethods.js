import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SessionsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'sessions.insert'(data) {
        check(data, {
            sessionTitle: String,
            casePresenter: String,
            facilitator: String,
            coordinator: String,
            presentingSpecialist: String,
            supportingSpecialist1: String,
            supportingSpecialist2: String,
            participantGroup: String,
            dateTime: String,
            presentationsDue: String,
            newMaterial: Boolean,
            color: String,
            topic: String,
            notes: String,
        });
        
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
        check(data, {
            sessionTitle: String,
            casePresenter: String,
            facilitator: String,
            coordinator: String,
            presentingSpecialist: String,
            supportingSpecialist1: String,
            supportingSpecialist2: String,
            participantGroup: String,
            dateTime: String,
            presentationsDue: String,
            newMaterial: Boolean,
            color: String,
            topic: String,
            notes: String,
        });
        return await SessionsCollection.updateAsync(sessionsId, {
            $set: data
        });
    }
});