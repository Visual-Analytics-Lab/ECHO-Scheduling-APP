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

  'files.deleteHeadshot'(specialistId, fileId) {
    check(specialistId, String);
    check(fileId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // Remove the file
    HeadshotsCollection.remove(fileId);

    // Update specialist
    SpecialistsCollection.update(specialistId, {
      $set: { headshotFileId: null, hasHeadShot: false }
    });

    return true;
  },

  'files.deleteResume'(specialistId, fileId) {
    check(specialistId, String);
    check(fileId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // Remove the file
    ResumesCollection.remove(fileId);

    // Update specialist
    SpecialistsCollection.update(specialistId, {
      $set: { resumeFileId: null, hasResume: false }
    });

    return true;
  },
});