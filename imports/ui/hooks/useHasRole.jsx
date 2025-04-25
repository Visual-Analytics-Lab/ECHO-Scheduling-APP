import { useTracker } from 'meteor/react-meteor-data';
import { RolesCollection } from '../../api/collections';
import { useMemo } from 'react';

export const useHasRole = (user, allowedRoles = []) => {
  // Always run the useMemo and useTracker hooks, regardless of user state
  const allowedRolesMemo = useMemo(() => allowedRoles, [JSON.stringify(allowedRoles)]);

  // Use the useTracker hook to subscribe to roles and fetch the allowed role IDs
  const { ready, data: allowedRoleIds } = useTracker(() => {
    const handle = Meteor.subscribe('roles');
    const isReady = handle.ready();

    const ids = isReady
      ? RolesCollection.find({ title: { $in: allowedRolesMemo } }).fetch().map(doc => doc._id)
      : [];

    return { ready: isReady, data: ids };
  }, [JSON.stringify(allowedRolesMemo)]);  // Only re-run when `allowedRoles` changes

  // If no user, return false for hasRole and true for ready (since we're done loading roles)
  if (!user) return { hasRole: false, ready: true };

  // If roles aren't ready, return false for hasRole and false for ready
  if (!ready) return { hasRole: false, ready: false };

  // Return whether the user has one of the allowed roles
  return { hasRole: allowedRoleIds.includes(user.role_id), ready: ready };
};