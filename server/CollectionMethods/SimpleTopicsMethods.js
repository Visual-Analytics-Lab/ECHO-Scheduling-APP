import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SimpleTopicsCollection } from '../../imports/api/collections';

Meteor.methods({
  async 'simpleTopics.insert'(topicData) {
    check(topicData, Object);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add a topic');
    }

    // Validate required fields
    if (!topicData.title) {
      throw new Meteor.Error('validation-error', 'Topic title is required');
    }

    return await SimpleTopicsCollection.insertAsync({
      title: topicData.title,
      description: topicData.description || '',
      createdAt: new Date(),
      createdBy: this.userId,
    });
  },

  async 'simpleTopics.update'(topicId, topicData) {
    check(topicId, String);
    check(topicData, Object);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update a topic');
    }

    const topic = await SimpleTopicsCollection.findOneAsync(topicId);
    if (!topic) {
      throw new Meteor.Error('not-found', 'Topic not found');
    }

    // Validate required fields
    if (!topicData.title) {
      throw new Meteor.Error('validation-error', 'Topic title is required');
    }

    return await SimpleTopicsCollection.updateAsync(topicId, {
      $set: {
        title: topicData.title,
        description: topicData.description || '',
        updatedAt: new Date(),
        updatedBy: this.userId,
      },
    });
  },

  async 'simpleTopics.remove'(topicId) {
    check(topicId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete a topic');
    }

    const topic = await SimpleTopicsCollection.findOneAsync(topicId);
    if (!topic) {
      throw new Meteor.Error('not-found', 'Topic not found');
    }

    return await SimpleTopicsCollection.removeAsync(topicId);
  },
});