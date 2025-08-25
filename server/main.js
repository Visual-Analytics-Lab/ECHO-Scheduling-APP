import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import '../imports/api/collections';
import './publications';
import './CollectionMethods/SpecialistsMethods';
import './CollectionMethods/ParticipantGroupsMethods';
import './CollectionMethods/SemesterMethods';
import './CollectionMethods/SeriesMethods';
import './CollectionMethods/TopicsMethods';
import './CollectionMethods/CategoriesMethods';
import './CollectionMethods/UsersMethods';
import './CollectionMethods/SessionsMethods';
import './CollectionMethods/RolesMethods';
import './CollectionMethods/Accounts';
import './CollectionMethods/backfill.js';
import '../imports/api/export';
import './passwordMethods.js';
// if (Meteor.isServer) {
//   Meteor.startup(async () => {
//       const testUser = {
//         username: 'testuser',
//         email: 'test@example.com',
//         password: 'testpassword',
//       };
//       Meteor.call('users.insert', testUser, (error, result) => {
//         if (error) {
//           console.log('Test user already exists');
//         } else {
//           console.log('Test user created');
//         }
//       })
//   });
// }
