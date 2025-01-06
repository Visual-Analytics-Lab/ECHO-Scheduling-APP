import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TopicsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'topics.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            title: String,
            description: String,
        });
        
        const topicsId = await TopicsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', topicsId);
        return topicsId;
    },
    'topics.remove'(topicsId) {
        check(topicsId, String);
        return TopicsCollection.remove(topicsId);
    },
    'topics.update'(topicsId, data) {
        check(topicsId, String);
        check(data, {
            title: String,
            description: String
        });
        return TopicsCollection.update(topicsId, {
            $set: data
        });
    }
});