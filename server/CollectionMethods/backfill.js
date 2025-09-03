// import { Meteor } from 'meteor/meteor';
// import { Accounts } from 'meteor/accounts-base';
// import { SpecialistsCollection } from '../../imports/api/collections';

// // This will run automatically when the server starts
// Meteor.startup(async () => {
//   if (Meteor.isServer) {
//     // Add a delay to ensure all collections are properly initialized
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     console.log('🔧 Checking for missing user connections on server startup...');
//     await createMissingUserConnections();
//   }
// });

// // Manual method for on-demand execution
// Meteor.methods({
//   async 'specialists.addMissingUsers'() {
//     if (!this.userId) {
//       throw new Meteor.Error('not-authorized', 'You must be logged in');
//     }
//     return await createMissingUserConnections();
//   },

//   async 'specialists.checkMissingUsers'() {
//     return await checkMissingUsers();
//   }
// });

// // Debug function to see what SpecialistsCollection actually contains
// async function debugSpecialistsCollection() {
//   console.log('🔍 Debugging SpecialistsCollection...');
  
//   try {
//     const cursor = SpecialistsCollection.find();
//     const count = await cursor.countAsync();
//     console.log('Number of specialists:', count);
    
//     const docs = await cursor.fetchAsync();
//     console.log('Fetched docs type:', typeof docs);
//     console.log('Is array?', Array.isArray(docs));
//     console.log('Number of docs:', docs.length);
    
//     if (docs.length > 0) {
//       console.log('First specialist:', {
//         id: docs[0]._id,
//         name: `${docs[0].firstName} ${docs[0].lastName}`,
//         email: docs[0].email,
//         userId: docs[0].userId
//       });
//     }
    
//     return docs;
//   } catch (error) {
//     console.error('Error accessing collection:', error);
//     return [];
//   }
// }

// // Helper function to check for missing users
// async function checkMissingUsers() {
//   console.log('🔍 Checking for missing users...');
  
//   try {
//     // Debug the collection first
//     const allSpecialists = await debugSpecialistsCollection();
    
//     if (!Array.isArray(allSpecialists)) {
//       console.error('❌ allSpecialists is not an array:', allSpecialists);
//       return {
//         totalSpecialists: 0,
//         missingUsersCount: 0,
//         missingUsers: []
//       };
//     }

//     console.log(`Found ${allSpecialists.length} specialists total`);
    
//     const missingUsers = allSpecialists.filter(specialist => {
//       const hasValidUserId = specialist.userId && 
//                             typeof specialist.userId === 'string' && 
//                             specialist.userId.length > 0;
//       return !hasValidUserId;
//     }).map(spec => ({
//       id: spec._id,
//       name: `${spec.firstName} ${spec.lastName}`,
//       email: spec.email,
//       firstName: spec.firstName,
//       lastName: spec.lastName,
//       createdAt: spec.createdAt
//     }));

//     console.log(`Found ${missingUsers.length} specialists needing users`);
    
//     return {
//       totalSpecialists: allSpecialists.length,
//       missingUsersCount: missingUsers.length,
//       missingUsers: missingUsers
//     };

//   } catch (error) {
//     console.error('Error in checkMissingUsers:', error);
//     return {
//       totalSpecialists: 0,
//       missingUsersCount: 0,
//       missingUsers: [],
//       error: error.message
//     };
//   }
// }

// // Main function that handles the user creation
// async function createMissingUserConnections() {
//   try {
//     console.log('🔍 Starting user connection check...');
    
//     const checkResult = await checkMissingUsers();
    
//     if (checkResult.error) {
//       throw new Error(checkResult.error);
//     }
    
//     if (checkResult.missingUsersCount === 0) {
//       console.log('✅ All specialists already have user accounts connected');
//       return {
//         success: true,
//         message: 'All specialists already have user accounts connected',
//         action: 'none'
//       };
//     }

//     console.log(`Found ${checkResult.missingUsersCount} specialists needing user accounts`);

//     const results = {
//       usersCreated: 0,
//       usersLinked: 0,
//       errors: []
//     };

//     for (const specialist of checkResult.missingUsers) {
//       try {
//         // Check if user already exists by email
//         const existingUser = await Meteor.users.findOneAsync({ 
//           'emails.address': specialist.email.toLowerCase().trim()
//         });

//         if (existingUser) {
//           console.log(`📌 Linking specialist ${specialist.name} to existing user ${existingUser._id}`);
          
//           await SpecialistsCollection.updateAsync(specialist.id, {
//             $set: { userId: existingUser._id }
//           });

//           await Meteor.users.updateAsync(existingUser._id, {
//             $set: {
//               specialist_id: [specialist.id],
//               role_id: 'jDkfrfcuYsHazRMbD',
//               firstName: specialist.firstName,
//               lastName: specialist.lastName
//             }
//           });

//           results.usersLinked++;
//           continue;
//         }

//         // Create new user account
//         console.log(`🆕 Creating user for: ${specialist.name} (${specialist.email})`);

//         let username = specialist.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
//         let counter = 1;
//         const originalUsername = username;

//         while (await Meteor.users.findOneAsync({ username })) {
//           username = `${originalUsername}${counter}`;
//           counter++;
//           if (counter > 50) {
//             username = `user_${Math.random().toString(36).substring(2, 10)}`;
//             break;
//           }
//         }

//         const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';

//         const userId = await Accounts.createUserAsync({
//           username: username,
//           email: specialist.email.toLowerCase().trim(),
//           password: tempPassword
//         });

//         await Meteor.users.updateAsync(userId, {
//           $set: {
//             firstName: specialist.firstName,
//             lastName: specialist.lastName,
//             role_id: 'jDkfrfcuYsHazRMbD',
//             specialist_id: [specialist.id],
//             emails: [{ address: specialist.email.toLowerCase().trim(), verified: false }],
//             createdAt: new Date()
//           }
//         });

//         await SpecialistsCollection.updateAsync(specialist.id, {
//           $set: { 
//             userId: userId,
//             createdAt: specialist.createdAt || new Date()
//           }
//         });

//         console.log(`✅ Created user ${username} for ${specialist.name}`);
//         console.log(`   Temporary password: ${tempPassword}`);
//         results.usersCreated++;

//       } catch (error) {
//         console.error(`❌ Error creating user for ${specialist.email}:`, error.message);
//         results.errors.push({
//           specialistId: specialist.id,
//           name: specialist.name,
//           email: specialist.email,
//           error: error.message
//         });
//       }
//     }

//     const resultMessage = `Created ${results.usersCreated} users and linked ${results.usersLinked} specialists`;
//     console.log(`📊 ${resultMessage}`);
    
//     if (results.errors.length > 0) {
//       console.warn(`⚠️  ${results.errors.length} errors occurred during processing`);
//     }

//     return {
//       success: true,
//       message: resultMessage,
//       results: results,
//       action: 'auto'
//     };

//   } catch (error) {
//     console.error('❌ Error in user connection process:', error);
//     return {
//       success: false,
//       message: `User connection failed: ${error.message}`,
//       error: error.message
//     };
//   }
// }

// console.log('🔧 User connection utility loaded');