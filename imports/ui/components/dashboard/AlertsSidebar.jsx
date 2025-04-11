import React from "react";
import { SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

const ThisWeekSessions = () => {
  Meteor.subscribe("sessions");

  const sessions = useTracker(() => {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const first =  firstDayOfWeek.toISOString();
    // console.log(firstDayOfWeek.toISOString());
    const lastDayOfWeek = new Date(today);
    lastDayOfWeek.setDate(today.getDate() - today.getDay() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    const last = lastDayOfWeek.toISOString();
    return SessionsCollection.find({
      dateTime: { $gte: first, $lte: last }
    }).fetch();
  }, []);
  // console.log(sessions);

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
                  {session.sessionTitle || "Untitled session"}
                {" "}
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
