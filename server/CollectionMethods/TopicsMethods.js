import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { TopicsCollection } from '../../imports/api/collections';

// Required fields and their type must be included in the insert and update method checks
Meteor.methods({
    async 'topics.insert'(data) {
        //console.log('Received data:', data);
        check(data, Match.ObjectIncluding({
            title: String,
        }));
        
        const topicsId = await TopicsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', topicsId);
        return topicsId;
    },
    async 'topics.remove'(topicsId) {
        check(topicsId, String);
        return await TopicsCollection.removeAsync(topicsId);
    },
    async 'topics.update'(topicsId, data) {
        check(topicsId, String);
        check(data, Match.ObjectIncluding({
            title: String,
        }));
        return await TopicsCollection.updateAsync(topicsId, {
            $set: data
        });
    }
});