import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
  Meteor.startup(() => {
    const user = Meteor.users.findOneAsync({ username: 'testuser' });

    if (!user) {
      Accounts.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword'
      });
      console.log('Test user created');
    }
  });
}
