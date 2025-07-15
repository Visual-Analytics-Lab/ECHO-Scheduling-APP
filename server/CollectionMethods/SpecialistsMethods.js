import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SpecialistsCollection, TopicsCollection, CategoriesCollection } from '../../imports/api/collections';

// Required fields and their type must be included in the insert and update method checks
Meteor.methods({
    async 'specialists.insert'(data) {
        //console.log('Received data:', data);
        check(data, Match.ObjectIncluding({
          firstName: String,
          lastName: String,
          email: String,
        }));
        const email = data.email.trim().toLowerCase();
        const existingUser = await Meteor.users.rawCollection().findOne({ 'emails.address': email });

        if (!existingUser) {
          throw new Meteor.Error('user-not-found', `No user exists with email ${email}`);
        }

        // Normalize and store
        data.email = email;
        
        const specialistId = await SpecialistsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', specialistId);
        return specialistId;
    },

    async 'specialists.remove'(specialistId) {
      check(specialistId, String);
      // Remove the specialist from the SpecialistsCollection
      const specialist = await SpecialistsCollection.findOneAsync(specialistId);
      if (!specialist) {
        throw new Meteor.Error('not-found', 'Specialist not found');
      }
      const specialistRemoved = await SpecialistsCollection.removeAsync(specialistId);
      
      if (specialistRemoved) {
        // Define the array of collections that need to be updated
        // Make sure these are imported at the top
        if (specialist.userId) {
          await Meteor.users.removeAsync(specialist.userId);
        }
        const collectionsToUpdate = [
          TopicsCollection,
          CategoriesCollection,
        ];
  
        // Iterate over each collection and remove the specialistId from the specialists_ids array
        for (const collection of collectionsToUpdate) {
          await collection.updateAsync(
            { specialists_ids: specialistId },  // Find documents containing the specialistId in the array
            { $pull: { specialists_ids: specialistId } }, // Remove the specialistId from the array
            { multi: true } // Apply to all documents with this specialistId in the array
          );
        }
        return true;
      }
      return false;
    },

    async 'specialists.update'(specialistId, data) {
      check(specialistId, String);
      check(data, Match.ObjectIncluding({
        firstName: String,
        lastName: String,
        email: String,
      }));

      const email = data.email.trim().toLowerCase();
      data.email = email;

      // Update the specialist
      const specialistUpdateResult = await SpecialistsCollection.updateAsync(specialistId, {
        $set: data
      });

      // Find the specialist to get the userId
      const specialist = await SpecialistsCollection.findOneAsync(specialistId);
      if (specialist?.userId) {
        await Meteor.users.updateAsync(specialist.userId, {
          $set: {
            firstName: data.firstName,
            lastName: data.lastName,
            'emails.0.address': email
          }
        });
      }

      return specialistUpdateResult;
    }

});