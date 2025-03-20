import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TopicsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'topics.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            title: String,
            specialists_ids: [String],
            description: String,
        });
        
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
        check(data, {
            title: String,
            specialists_ids: [String],
            description: String,
        });
        return await TopicsCollection.updateAsync(topicsId, {
            $set: data
        });
    }
});