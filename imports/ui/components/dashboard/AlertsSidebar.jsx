import React from "react";
import { SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

const ThisWeekSessions = ({ selectedWeekDate }) => {
  Meteor.subscribe("sessions");

  const sessions = useTracker(() => {
    const referenceDate = selectedWeekDate ? new Date(selectedWeekDate) : new Date();

    // Set to Sunday (start of week based on referenceDate)
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Set to Saturday (end of week)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return SessionsCollection.find({
      dateTime: { $gte: startOfWeek, $lte: endOfWeek }
    }).fetch();
  }, [selectedWeekDate]);

  return (
    <aside className="w-64 bg-white text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="text-xl text-white items-center">This Week's Sessions</h2>
      </div>
      <div className="p-4 text-black">
        {sessions.length === 0 ? (
          <p>No sessions scheduled for this week.</p>
        ) : (
          <ul>
            {sessions.map((session) => (
              <li key={session._id}>
                <span style={{ color: session.color || 'inherit' }}>
                  {session.sessionTitle || "Untitled session"} {" "}
                  - {new Date(session.dateTime).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default ThisWeekSessions;
