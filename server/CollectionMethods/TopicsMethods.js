import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SpecialistsCollection, TopicsCollection } from '../../imports/api/collections';

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

        const topic = await TopicsCollection.findOneAsync(topicsId);
        if (!topic) {
            throw new Meteor.Error('not-found', 'Topic not found');
        }

        // Remove the topic document
        const result = await TopicsCollection.removeAsync(topicsId);

        if (result) {
            // Remove the topic ID from all specialists
            await SpecialistsCollection.updateAsync(
            { topics_ids: topicsId },
            { $pull: { topics_ids: topicsId } },
            { multi: true }
            );
        }

        return result;
    },
    async 'topics.update'(topicsId, data) {
        check(topicsId, String);
        check(data, Match.ObjectIncluding({
            title: String,
        }));
        return await TopicsCollection.updateAsync(topicsId, {
            $set: data
        });
    },
    
    // Add a specialist to a topic's specialists_ids if not already present
    async 'topics.addSpecialist'(topicId, specialistId) {
        check(topicId, String);
        check(specialistId, String);

        if (!specialistId) return; // Don't add empty specialist

        const topic = await TopicsCollection.findOneAsync(topicId);
        if (!topic) {
            throw new Meteor.Error('not-found', 'Topic not found');
        }

        // Only add if not already in the array
        if (!topic.specialists_ids || !topic.specialists_ids.includes(specialistId)) {
            return await TopicsCollection.updateAsync(topicId, {
                $addToSet: { specialists_ids: specialistId }
            });
        }
    }
});