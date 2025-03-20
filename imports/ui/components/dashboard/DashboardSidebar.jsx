import React from "react";
import { useTracker } from 'meteor/react-meteor-data';
import { SpecialistsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";

const DashboardSidebar = () => {
  // Example subscription/tracker if you have specialists data
  Meteor.subscribe("specialists");
  const specialists = useTracker(() => SpecialistsCollection.find().fetch());

  return (
    <aside className="w-64 bg-gray-100 text-black m-4 border border-[#721D35] rounded-lg shadow-xl">
      <div className="py-3 px-4 bg-[#721D35] rounded-t-lg">
        <h2 className="text-lg font-semibold text-white">
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
