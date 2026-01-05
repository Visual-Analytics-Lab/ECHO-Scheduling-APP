import { FilesCollection } from 'meteor/ostrio:files';
import { Meteor } from 'meteor/meteor';

let storagePath = '';

if (Meteor.isServer) {
  const path = require('path');
  const projectRoot = process.env.PWD || process.cwd();
  storagePath = path.join(projectRoot, '.meteor', 'local');
}

// Headshots Collection
export const HeadshotsCollection = new FilesCollection({
  collectionName: 'Headshots',
  allowClientCode: false,
  storagePath: Meteor.isServer ? () => `${storagePath}/headshots` : undefined,
  onBeforeUpload(file) {
    // Allow only images
    if (/png|jpg|jpeg/i.test(file.extension)) {
      if (file.size <= 5242880) { // 5MB limit
        return true;
      }
      return 'File size must be less than 5MB';
    }
    return 'Please upload an image (PNG, JPG, JPEG)';
  }
});

// Resumes Collection
export const ResumesCollection = new FilesCollection({
  collectionName: 'Resumes',
  allowClientCode: false,
  storagePath: Meteor.isServer ? () => `${storagePath}/resumes` : undefined,
  onBeforeUpload(file) {
    // Allow PDFs and common document formats
    if (/pdf|doc|docx/i.test(file.extension)) {
      if (file.size <= 10485760) { // 10MB limit
        return true;
      }
      return 'File size must be less than 10MB';
    }
    return 'Please upload a PDF or Word document';
  }
});