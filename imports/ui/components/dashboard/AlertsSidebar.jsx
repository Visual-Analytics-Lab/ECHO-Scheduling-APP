import React from "react";
import { SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

const ThisWeekSessions = ({ selectedDate }) => {
  Meteor.subscribe("sessions");
  
  const sessions = useTracker(() => {
    // Use selectedDate if provided, otherwise fall back to current date
    const referenceDate = selectedDate ? new Date(selectedDate) : new Date();
    
    // Set to Sunday (start of the week) based on the selected/reference date
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Set to Saturday (end of the week)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    return SessionsCollection.find({
      dateTime: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    }).fetch();
  }, [selectedDate]); // Add selectedDate to dependency array
  
  // Helper function to get week display text
  const getWeekDisplayText = () => {
    if (!selectedDate) return "This Week's Sessions";
    
    const referenceDate = new Date(selectedDate);
    const currentDate = new Date();
    
    // Check if it's the current week
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const selectedWeekStart = new Date(referenceDate);
    selectedWeekStart.setDate(referenceDate.getDate() - referenceDate.getDay());
    selectedWeekStart.setHours(0, 0, 0, 0);
    
    if (currentWeekStart.getTime() === selectedWeekStart.getTime()) {
      return "This Week's Sessions";
    }
    
    // Format the week range for display
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(selectedWeekStart.getDate() + 6);
    
    const formatOptions = { month: 'short', day: 'numeric' };
    const startStr = selectedWeekStart.toLocaleDateString('en-US', formatOptions);
    const endStr = weekEnd.toLocaleDateString('en-US', formatOptions);
    
    return `Week of ${startStr} - ${endStr}`;
  };

  return (
    <aside className="w-64 bg-white text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="text-xl text-white items-center">
          {getWeekDisplayText()}
        </h2>
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