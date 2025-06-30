import React, { useMemo, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { SpecialistsCollection, SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";

const DashboardSidebar = ({ selectedDate }) => {
  // Move subscriptions to useEffect to avoid calling on every render
  useEffect(() => {
    const sub1 = Meteor.subscribe("specialists");
    const sub2 = Meteor.subscribe("sessions");
    
    return () => {
      sub1.stop();
      sub2.stop();
    };
  }, []);

  // Memoize the date calculations to avoid recalculating on every render
  const { startOfWeek, endOfWeek, referenceDate } = useMemo(() => {
    // Use selectedDate if provided, otherwise fall back to current date
    const refDate = selectedDate ? new Date(selectedDate) : new Date();

    // Set to Sunday (start of the week) based on the selected/reference date
    const start = new Date(refDate);
    start.setDate(refDate.getDate() - refDate.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);
    
    // Set to Saturday (end of the week)
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday
    end.setHours(23, 59, 59, 999);

    return {
      startOfWeek: start,
      endOfWeek: end,
      referenceDate: refDate
    };
  }, [selectedDate]);

  const sessions = useTracker(() =>
    SessionsCollection.find({
      dateTime: { $gte: startOfWeek, $lte: endOfWeek },
    }).fetch(),
    [startOfWeek.getTime(), endOfWeek.getTime()] // Use timestamps for stable comparison
  );

  // Memoize the specialist processing to avoid recalculation
  const { sessionCountMap, uniqueSpecialistIds } = useMemo(() => {
    const countMap = {};
    const specialistIds = [];
    
    sessions.forEach((session) => {
      const ids = [
        session.presentingSpecialist,
        session.supportingSpecialist1,
        session.supportingSpecialist2
      ];
    
      ids.forEach(id => {
        if (id) {
          countMap[id] = (countMap[id] || 0) + 1;
          specialistIds.push(id);
        }
      });
    });

    // Using set to remove duplicates
    const uniqueIds = [...new Set(specialistIds)];

    return {
      sessionCountMap: countMap,
      uniqueSpecialistIds: uniqueIds
    };
  }, [sessions]);

  const specialists = useTracker(() => {
    if (uniqueSpecialistIds.length === 0) return [];
    
    return SpecialistsCollection.find({
      _id: { $in: uniqueSpecialistIds },
    }).fetch();
  }, [uniqueSpecialistIds.join(',')]); // Use string join for stable comparison

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