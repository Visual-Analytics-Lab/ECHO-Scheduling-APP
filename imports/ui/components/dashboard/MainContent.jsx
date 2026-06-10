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
  CategoriesCollection,
  RolesCollection
} from "../../../api/collections";
import { buildSessionTooltip } from "../../utils/tooltipHelpers";

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/border.css';
import "react-toastify/dist/ReactToastify.css";

const MainContent = () => {
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const subscriptions = [
      Meteor.subscribe('sessions'),
      Meteor.subscribe("specialists"),
      Meteor.subscribe("participantGroups"),
      Meteor.subscribe("topics"),
      Meteor.subscribe("categories"),
    ];
    return () => subscriptions.forEach(sub => sub.stop());
  }, []);

  const sessions = useTracker(() => SessionsCollection.find().fetch());
  const specialists = useTracker(() => SpecialistsCollection.find().fetch());
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());
  const categories = useTracker(() => CategoriesCollection.find().fetch());

  const handleDatesSet = (arg) => {
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
                firstDay={1}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="100%"
                // Show 8 hours: 7am to 7pm
                slotMinTime="07:00:00"
                slotMaxTime="19:00:00"
                scrollTime="08:00:00"
                events={sessions?.map(session => {
                  const start = new Date(session.dateTime);
                  const end = new Date(start);
                  end.setHours(end.getHours() + 1);
                  return {
                    title: session.sessionTitle,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    backgroundColor: session.color,
                    borderColor: session.color,
                    extendedProps: {
                      sessionId: session._id,
                      color: session.color,
                      presentingSpecialist: session.presentingSpecialist,
                      supportingSpecialist1: session.supportingSpecialist1,
                      supportingSpecialist2: session.supportingSpecialist2,
                      supportingSpecialist3: session.supportingSpecialist3,
                      supportingSpecialist4: session.supportingSpecialist4,
                      participantGroup: session.participantGroup,
                      // Pass BOTH topic and presentationTitle so tooltip can find it
                      topic: session.presentationTitle || session.topic || '',
                    },
                  };
                })}
                  
                eventDidMount={({ el, event }) => {
                  tippy(el, {
                    allowHTML: true,
                    content: buildSessionTooltip({ event }),
                    theme: "custom",
                    placement: "top",
                    arrow: true,
                  });
                }}

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