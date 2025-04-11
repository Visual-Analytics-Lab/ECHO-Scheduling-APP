import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { SpecialistsCollection, SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";

const DashboardSidebar = () => {
  Meteor.subscribe("specialists");
  Meteor.subscribe("sessions");

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const sessions = useTracker(() =>
    SessionsCollection.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    }).fetch()
  );
  const sessionSpecialistIds = sessions.reduce((acc, session) => {
    if (session.presentingSpecialist) acc.push(session.presentingSpecialist);
    if (session.supportingSpecialist1) acc.push(session.supportingSpecialist1);
    if (session.supportingSpecialist2) acc.push(session.supportingSpecialist2);
    return acc;
  }, []);

  //using set to remove duplicates
  const uniqueSpecialistIds = [...new Set(sessionSpecialistIds)];

  const specialists = useTracker(() =>
    SpecialistsCollection.find({
      _id: { $in: uniqueSpecialistIds },
    }).fetch()
  );

  return (
    <aside className="w-64 bg-gray-100 text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="flex text-xl text-white items-center">
          Specialists Scheduled this Week
        </h2>
      </div>

      <nav className="space-y-2 p-2">
        {specialists.map((specialist) => (
          <div key={specialist._id} className="text-sm">
            {specialist.name}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
