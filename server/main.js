import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import '../imports/api/collections';
import './publications';
import './CollectionMethods/SpecialistsMethods';
import './CollectionMethods/ParticipantGroupsMethods';
import './CollectionMethods/CohortGroupsMethods';
import './CollectionMethods/TopicsMethods';
import './CollectionMethods/UsersMethods'
import './CollectionMethods/SessionsMethods'

if (Meteor.isServer) {
  Meteor.startup(async () => {
    try {
      const user = await Meteor.users.findOneAsync({ username: 'testuser' });

      if (!user) {
        Accounts.createUser({
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword',
        });
        console.log('Test user created');
      } else {
        console.log('Test user already exists');
      }
    } catch (error) {
      console.error('Error checking or creating user:', error);
    }
  });
}
