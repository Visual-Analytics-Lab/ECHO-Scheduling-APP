import React, { useEffect, useState, useRef } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

import Navbar from "../navbar/Navbar";
import DashboardSidebar from "./DashboardSidebar";
import AlertsSidebar from "./AlertsSidebar";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  SessionsCollection,
  SpecialistsCollection,
  ParticipantGroupsCollection,
  SemesterCollection,
  SeriesCollection,
  TopicsCollection,
  RolesCollection
} from "../../../api/collections";
import { buildSessionTooltip } from "../../utils/tooltipHelpers";

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // ensure styles are bundled
import 'tippy.js/dist/border.css';
import "react-toastify/dist/ReactToastify.css";

const MainContent = () => {
  // State to track the currently viewed week/date
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const calendarRef = useRef(null);

  // Subscribe to collections
  useEffect(() => {
    const subscriptions = [
      Meteor.subscribe('sessions'),
      // Meteor.subscribe("users"),
      Meteor.subscribe("specialists"),
      Meteor.subscribe("participantGroups"),
      // Meteor.subscribe("semesters"),
      // Meteor.subscribe("series"),
      Meteor.subscribe("topics"),
      // Meteor.subscribe("roles"),
    ];
    return () => subscriptions.forEach(sub => sub.stop());
  }, []);

  const sessions = useTracker(() => SessionsCollection.find().fetch());
  const specialists = useTracker(() => SpecialistsCollection.find().fetch());
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  // const semesters = useTracker(() => SemesterCollection.find().fetch());
  // const series = useTracker(() => SeriesCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());
  // const roles = useTracker(() => RolesCollection.find().fetch());

  // Handle calendar view changes (when user navigates to different weeks/dates)
  const handleDatesSet = (arg) => {
    // arg.start is the start date of the current view
    setCurrentViewDate(new Date(arg.start));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 shadow-full-border">

      <header className="bg-gray-200 text-center py-4">
        <h1 className="text-3xl font-bold text-[#721D35]">Dashboard</h1>
      </header>
      <div className="flex flex-1">
        <DashboardSidebar selectedDate={currentViewDate} />
        <main className="flex-1 p-4">
          <div className="bg-white border border-gray-300 rounded-lg shadow-full-border">
            <div className="text-center text-black py-3 px-4 rounded-t-lg">
              <h2 className="text-2xl">Weekly Calendar</h2>
            </div>
            <div className="p-4 h-[calc(100vh-180px)] overflow-y-auto">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="100%"
                events={ sessions?.map(session => {
                  const start = new Date(session.dateTime);
                  const end = new Date(start);
                  end.setHours(end.getHours() + 1);
                  return {
                    title: session.sessionTitle,
                    start: start.toISOString(),
                    end:   end.toISOString(),
                    backgroundColor: session.color,
                    borderColor:     session.color,
                    extendedProps: {
                      sessionId: session._id,
                      color: session.color,
                      presentingSpecialist: session.presentingSpecialist,
                      supportingSpecialist1: session.supportingSpecialist1,
                      supportingSpecialist2: session.supportingSpecialist2,
                      participantGroup: session.participantGroup,
                      topic: session.topic,
                    },
                  };
                })}
                  
                // Build tooltip on Hover
                eventDidMount={({ el, event }) => {
                  tippy(el, {
                    allowHTML: true,
                    content: buildSessionTooltip({ event }),
                    theme: "custom",
                    placement: "top",
                    arrow: true,
                  });
                }}

                // Track when the user navigates to different dates/weeks
                datesSet={handleDatesSet}
              />
            </div>
          </div>
        </main>
        <AlertsSidebar selectedDate={currentViewDate} />
      </div>
    </div>
  );
};

export default MainContent;