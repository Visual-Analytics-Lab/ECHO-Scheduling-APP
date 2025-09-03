import React, { useEffect, useMemo } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { saveAs } from 'file-saver';
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
  // Get both specialist IDs and user email for fallback
  const specialistIds = useMemo(() => user?.specialist_id || [], [user]);
  const userEmail = useMemo(() => user?.emails?.[0]?.address, [user]);

  const allSpecialists = useTracker(() => SpecialistsCollection.find().fetch(), []);
  const topics = useTracker(() => TopicsCollection.find().fetch(), []);
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch(), []);
  const allUsers = useTracker(() => Meteor.users.find().fetch(), []);

  const userSessions = useTracker(() => {
    const userId = Meteor.userId();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // set to start of today

    // If user has specialist IDs, use them
    if (specialistIds.length > 0) {
      return SessionsCollection.find({
        dateTime: { $gte: today },
        $or: [
          { presentingSpecialist: { $in: specialistIds } },
          { supportingSpecialist1: { $in: specialistIds } },
          { supportingSpecialist2: { $in: specialistIds } },
          { facilitator: userId },
          { supportingFacilitator: userId }
        ]
      }, { sort: { dateTime: 1 } }).fetch();
    } 
    // If user doesn't have specialist IDs, use email to find sessions where they're a facilitator
    else if (userEmail) {
      // Find user IDs that match the email (in case multiple users have same email)
      const matchingUserIds = allUsers
        .filter(u => u.emails?.some(email => email.address === userEmail))
        .map(u => u._id);
      
      return SessionsCollection.find({
        dateTime: { $gte: today },
        $or: [
          { facilitator: { $in: matchingUserIds } },
          { supportingFacilitator: { $in: matchingUserIds } }
        ]
      }, { sort: { dateTime: 1 } }).fetch();
    }
    // If no specialist IDs and no email, return empty array
    else {
      return [];
    }
  }, [specialistIds, userEmail, allUsers]);

  const getSpecialistNameById = (id) => {
    const match = allSpecialists.find((s) => s._id === id);
    return {
      name: match?.firstName && match?.lastName
        ? `${match.firstName} ${match.lastName}`
        : `Unknown (${id})`,
      color: match?.nameColor || '#000000'
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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Date not set';
    
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString()
    };
  };

  const handleExport = async () => {
    try {
      const base64 = await Meteor.callAsync('exportMySessionsExcel');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, 'MySessions.xlsx');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">My Schedule</h2>
      <button
        onClick={handleExport}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        📥 Export My Sessions
      </button>

      {userSessions.length === 0 ? (
        <p>No sessions found for your account.</p>
      ) : (
        <ul className="space-y-4">
          {userSessions.map((session) => {
            const dateTime = formatDateTime(session.dateTime);
            return (
              <li key={session._id} className="border p-4 rounded shadow">
                <p className="font-bold text-lg mb-2">
                  📅 {dateTime.date} at 🕒 {dateTime.time}
                </p>
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