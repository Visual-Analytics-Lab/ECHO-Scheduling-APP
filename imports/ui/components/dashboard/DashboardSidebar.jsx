import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { SpecialistsCollection, SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";

const DashboardSidebar = ({ selectedDate }) => {
  Meteor.subscribe("specialists");
  Meteor.subscribe("sessions");

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

  const sessions = useTracker(() =>
    SessionsCollection.find({
      dateTime: { $gte: startOfWeek, $lte: endOfWeek },
    }).fetch(),
    [selectedDate] // Add selectedDate to dependency array
  );

  const sessionCountMap = {};
  const sessionSpecialistIds = [];
  
  sessions.forEach((session) => {
    const ids = [
      session.presentingSpecialist,
      session.supportingSpecialist1,
      session.supportingSpecialist2
    ];
  
    ids.forEach(id => {
      if (id) {
        sessionCountMap[id] = (sessionCountMap[id] || 0) + 1;
        sessionSpecialistIds.push(id);
      }
    });
  });

  // Using set to remove duplicates
  const uniqueSpecialistIds = [...new Set(sessionSpecialistIds)];

  const specialists = useTracker(() =>
    SpecialistsCollection.find({
      _id: { $in: uniqueSpecialistIds },
    }).fetch(),
    [uniqueSpecialistIds] // Add dependency for specialists query
  );

  // Helper function to get week display text
  const getWeekDisplayText = () => {
    if (!selectedDate) return "Specialists Scheduled this Week";
    
    const currentDate = new Date();
    
    // Check if it's the current week
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const selectedWeekStart = new Date(referenceDate);
    selectedWeekStart.setDate(referenceDate.getDate() - referenceDate.getDay());
    selectedWeekStart.setHours(0, 0, 0, 0);
    
    if (currentWeekStart.getTime() === selectedWeekStart.getTime()) {
      return "Specialists Scheduled this Week";
    }
    
    // Format the week range for display
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(selectedWeekStart.getDate() + 6);
    
    const formatOptions = { month: 'short', day: 'numeric' };
    const startStr = selectedWeekStart.toLocaleDateString('en-US', formatOptions);
    const endStr = weekEnd.toLocaleDateString('en-US', formatOptions);
    
    return `Specialists for ${startStr} - ${endStr}`;
  };

  return (
    <aside className="w-64 bg-gray-100 text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="flex text-xl text-white items-center">
          {getWeekDisplayText()}
        </h2>
      </div>
      <div className="flex p-2 justify-between text-gray-500">
        <h4>Name</h4><h4># Sessions</h4>
      </div>
      <hr/>

      <nav className="flex flex-col space-y-2 px-3 py-2">
        {specialists.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No specialists scheduled for this week
          </div>
        ) : (
          specialists.map((specialist) => (
            <div key={specialist._id} className="flex justify-between text-lg" style={{ color: specialist.nameColor }}>
              <span>{specialist.firstName} {specialist.lastName}</span>
              <span className="text-gray-800 font-medium">
                {sessionCountMap[specialist._id] || 0}
              </span>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;