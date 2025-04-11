import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { SpecialistsCollection, SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";

const DashboardSidebar = () => {
  Meteor.subscribe("specialists");
  Meteor.subscribe("sessions");

  const now = new Date();

  // Set to Sunday (start of the week)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Set to Saturday (end of the week)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999);

  const sessions = useTracker(() =>
    SessionsCollection.find({
      dateTime: { $gte: startOfWeek, $lte: endOfWeek },
    }).fetch()
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
        sessionSpecialistIds.push(id); // this line re-adds your missing array
      }
    });
  });

  //using set to remove duplicates
  const uniqueSpecialistIds = [...new Set(sessionSpecialistIds)];

  const specialists = useTracker(() =>
    SpecialistsCollection.find({
      _id: { $in: uniqueSpecialistIds },
    }).fetch() 
  );
  console.log(specialists)

  return (
    <aside className="w-64 bg-gray-100 text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="flex text-xl text-white items-center">
          Specialists Scheduled this Week
        </h2>
      </div>
      <div className="flex p-2 justify-between text-gray-500">
        <h4>Name</h4><h4># Sessions</h4>
      </div>
      <hr/>

      <nav className="flex flex-col space-y-2 px-3 py-2">
        {specialists.map((specialist) => (
          <div key={specialist._id} className="flex justify-between text-lg" style={{ color: specialist.nameColor }}>
            <span>{specialist.firstName} {specialist.lastName}</span>
            <span className="text-gray-800 font-medium">
              {sessionCountMap[specialist._id] || 0}
            </span>
          </div>
        ))}
      </nav>

    </aside>
  );
};

export default DashboardSidebar;
