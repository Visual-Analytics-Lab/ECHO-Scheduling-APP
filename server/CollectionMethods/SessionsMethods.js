import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SessionsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'sessions.insert'(data) {
        check(data, {
            title: String,
            description: String,
        });
        
        const sessionsId = await SessionsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        return sessionsId;
    },
    'sessions.remove'(sessionsId) {
        check(sessionsId, String);
        return SessionsCollection.remove(sessionsId);
    },
    'sessions.update'(sessionsId, data) {
        check(sessionsId, String);
        check(data, {
            title: String,
            description: String
        });
        return SessionsCollection.update(sessionsId, {
            $set: data
        });
    }
});