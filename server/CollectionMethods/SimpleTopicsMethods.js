import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SimpleTopicsCollection } from '../../imports/api/collections';

Meteor.methods({
  'simpleTopics.insert'(topicData) {
    check(topicData, Object);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add a topic');
    }

    // Validate required fields
    if (!topicData.title) {
      throw new Meteor.Error('validation-error', 'Topic title is required');
    }

    return SimpleTopicsCollection.insert({
      title: topicData.title,
      description: topicData.description || '',
      createdAt: new Date(),
      createdBy: this.userId,
    });
  },

  'simpleTopics.update'(topicId, topicData) {
    check(topicId, String);
    check(topicData, Object);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update a topic');
    }

    const topic = SimpleTopicsCollection.findOne(topicId);
    if (!topic) {
      throw new Meteor.Error('not-found', 'Topic not found');
    }

    // Validate required fields
    if (!topicData.title) {
      throw new Meteor.Error('validation-error', 'Topic title is required');
    }

    return SimpleTopicsCollection.update(topicId, {
      $set: {
        title: topicData.title,
        description: topicData.description || '',
        updatedAt: new Date(),
        updatedBy: this.userId,
      },
    });
  },

  'simpleTopics.remove'(topicId) {
    check(topicId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete a topic');
    }

    const topic = SimpleTopicsCollection.findOne(topicId);
    if (!topic) {
      throw new Meteor.Error('not-found', 'Topic not found');
    }

    return SimpleTopicsCollection.remove(topicId);
  },
});