import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) => {
  // Attach custom fields manually
  user.role_id = options.role_id;
  user.specialist_id = options.specialist_id || [];
  user.createdAt = options.createdAt || new Date();

  // Include default behavior for profile
  if (options.profile) {
    user.profile = options.profile;
  }

  return user;
});
