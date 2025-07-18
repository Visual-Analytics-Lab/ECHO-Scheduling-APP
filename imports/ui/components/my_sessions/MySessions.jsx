import React, { useEffect, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import {
  SessionsCollection,
  SpecialistsCollection,
  TopicsCollection,
  ParticipantGroupsCollection
} from '../../../api/collections';

export const MySessions = () => {
  useEffect(() => {
    const handles = [
      Meteor.subscribe('sessions'),
      Meteor.subscribe('specialists'),
      Meteor.subscribe('topics'),
      Meteor.subscribe('participantGroups'),
      Meteor.subscribe('users'), // ✅ subscribe to users
    ];
    return () => handles.forEach((h) => h.stop());
  }, []);

  const user = useTracker(() => Meteor.user(), []);
  const specialistIds = useMemo(() => user?.specialist_id || [], [user]);

  const allSpecialists = useTracker(() => SpecialistsCollection.find().fetch(), []);
  const topics = useTracker(() => TopicsCollection.find().fetch(), []);
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch(), []);
  const allUsers = useTracker(() => Meteor.users.find().fetch(), []);

  const userSessions = useTracker(() => {
    const userId = Meteor.userId();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // set to start of today

    return SessionsCollection.find({
      dateTime: { $gte: today }, // Only sessions from today onward
      $or: [
        { presentingSpecialist: { $in: specialistIds } },
        { supportingSpecialist1: { $in: specialistIds } },
        { supportingSpecialist2: { $in: specialistIds } },
        { facilitator: userId },
        { supportingFacilitator: userId }
      ]
    }).fetch();
  }, [specialistIds]);

  const getSpecialistNameById = (id) => {
    const match = allSpecialists.find((s) => s._id === id);
    return {
      name: match?.firstName && match?.lastName
      ? `${match.firstName} ${match.lastName}`
      : `Unknown (${id})`,
      color:match?.nameColor || '#000000'
    };
  };

  const getUsernameById = (id) => {
    const user = allUsers.find((u) => u._id === id);
    return user?.username || `Unknown (${id})`;
  };

  const getTopicNameById = (id) => {
    if (!id) return 'Unknown Topic (missing ID)';
    const topic = topics.find((t) => t._id === id);
    return topic?.title || `Unknown Topic (${id})`;
  };

  const getGroupNameById = (id) => {
    const group = participantGroups.find((g) => g._id === id);
    return {
      name: group?.name || `Unknown Group (${id})`,
      color: group?.nameColor || '#000000'
    };
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">My Schedule</h2>
      {userSessions.length === 0 ? (
        <p>No sessions found for your account.</p>
      ) : (
        <ul className="space-y-4">
          {userSessions.map((session) => {
            const matchedRoles = [];
            if (specialistIds.includes(session.presentingSpecialist)) matchedRoles.push('Presenting Specialist');
            if (specialistIds.includes(session.supportingSpecialist1)) matchedRoles.push('Support 1');
            if (specialistIds.includes(session.supportingSpecialist2)) matchedRoles.push('Support 2');
            if (session.facilitator === Meteor.userId()) matchedRoles.push('Facilitator');
            if (session.supportingFacilitator === Meteor.userId()) matchedRoles.push('Supporting Facilitator');

            return (
              <li key={session._id} className="border p-4 rounded shadow">
                {(() => {
                  const { name, color } = getSpecialistNameById(session.presentingSpecialist);
                  return <p><strong>🎙️ Presenting Specialist:</strong> <span style={{ color }}>{name}</span></p>;
                })()}

                {(() => {
                  const { name, color } = getSpecialistNameById(session.supportingSpecialist1);
                  return <p><strong>🤝 Support 1:</strong> <span style={{ color }}>{name}</span></p>;
                })()}

                {(() => {
                  const { name, color } = getSpecialistNameById(session.supportingSpecialist2);
                  return <p><strong>🤝 Support 2:</strong> <span style={{ color }}>{name}</span></p>;
                })()}

                <p><strong>🧭 Facilitator:</strong> {getUsernameById(session.facilitator)}</p>
                <p><strong>🧭 Supporting Facilitator:</strong> {getUsernameById(session.supportingFacilitator)}</p>

                <p><strong>🏷️ Topic:</strong> {getTopicNameById(session.topic)}</p>

                {(() => {
                  const { name, color } = getGroupNameById(session.participantGroup);
                  return <p><strong>👥 Participant Group:</strong> <span style={{ color }}>{name}</span></p>;
                })()}


                {session.notes && (
                  <p><strong>📝 Notes:</strong> {session.notes}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};