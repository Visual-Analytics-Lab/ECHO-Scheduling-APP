import React from "react";
import { SessionsCollection } from "../../../api/collections";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

const AlertsSidebar = () => {
  Meteor.subscribe("sessions");
  const sessions = useTracker(() => SessionsCollection.find().fetch());

  return (
    <aside className="w-64 bg-white text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="text-xl text-white items-center">Alerts</h2>
      </div>
      <div className="p-4 text-black">
        <p>You have 1 upcoming presentation</p>
      </div>
    </aside>
  );
};

export default AlertsSidebar;
