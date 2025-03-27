import React from "react";
import { SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

const AlertsSidebar = () => {
  Meteor.subscribe("sessions");
  const sessions = useTracker(() => SessionsCollection.find().fetch());

  return (
    <aside className="w-64 bg-white m-4 border border-gray-300 rounded-lg shadow-xl">
      <div className="py-3 px-4 bg-[#721D35] rounded-t-lg">
        <h2 className="text-lg font-semibold text-white">Alerts</h2>
      </div>
      <div className="p-4 text-black">
        <p>You have 1 upcoming presentation</p>
      </div>
    </aside>
  );
};

export default AlertsSidebar;
