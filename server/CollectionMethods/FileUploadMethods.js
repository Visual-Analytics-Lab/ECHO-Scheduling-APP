import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HeadshotsCollection, ResumesCollection } from '../../imports/api/fileCollections';
import { SpecialistsCollection } from '../../imports/api/collections';

Meteor.methods({
  'files.uploadHeadshot'(specialistId, fileId) {
    check(specialistId, String);
    check(fileId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // Update specialist with headshot file ID
    SpecialistsCollection.update(specialistId, {
      $set: { headshotFileId: fileId, hasHeadShot: true }
    });

    return fileId;
  },

  'files.uploadResume'(specialistId, fileId) {
    check(specialistId, String);
    check(fileId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // Update specialist with resume file ID
    SpecialistsCollection.update(specialistId, {
      $set: { resumeFileId: fileId, hasResume: true }
    });

    return fileId;
  },

  async 'files.deleteHeadshot'(fileId) {
    check(fileId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    try {
      // Remove the file using collection's remove method
      await HeadshotsCollection.collection.removeAsync({ _id: fileId });
      return true;
    } catch (error) {
      console.error('Error deleting headshot:', error);
      throw new Meteor.Error('delete-failed', 'Failed to delete headshot file');
    }
  },

  async 'files.deleteResume'(fileId) {
    check(fileId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    try {
      // Remove the file using collection's remove method
      await ResumesCollection.collection.removeAsync({ _id: fileId });
      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Meteor.Error('delete-failed', 'Failed to delete resume file');
    }
  },
});