import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import Navbar from "../navbar/Navbar"; // if you have a separate navbar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { SessionsCollection } from "../../../api/collections";
import "react-toastify/dist/ReactToastify.css";
import { Meteor } from "meteor/meteor";
import DashboardSidebar from "./DashboardSidebar";
import AlertsSidebar from "./AlertsSidebar";

const MainContent = () => {
  const sessions = useTracker(() => {
    Meteor.subscribe("sessions");
    return SessionsCollection.find().fetch();
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 shadow-full-border">

      <header className="bg-gray-200 text-center py-4">
        <h1 className="text-3xl font-bold text-[#721D35]">Dashboard</h1>
      </header>
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-4">
          <div className="bg-white border border-gray-300 rounded-lg shadow-full-border">
            <div className="text-center text-black py-3 px-4 rounded-t-lg">
              <h2 className="text-2xl">Weekly Calendar</h2>
            </div>
            <div className="p-4 h-[calc(100vh-180px)] overflow-y-auto">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="100%"
                events={
                  sessions?.map((session) => ({
                    title: session.sessionTitle,
                    start: new Date(session.dateTime).toISOString(),
                    end: session.presentationsDue
                      ? new Date(session.presentationsDue).toISOString()
                      : null,
                    backgroundColor: session.color,
                    borderColor: session.color,
                    extendedProps: {
                      sessionId: session._id,
                    },
                  })) || []
                }
              />
            </div>
          </div>
        </main>
        <AlertsSidebar />
      </div>
    </div>
  );
};

export default MainContent;
