import React, { useEffect, useState, useRef } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  SessionsCollection,
  SpecialistsCollection,
  ParticipantGroupsCollection,
  TopicsCollection,
} from "../../../api/collections";
import { buildSessionTooltip } from "../../utils/tooltipHelpers";

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/border.css';

const MySessions = () => {
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [timePeriodFilter, setTimePeriodFilter] = useState("upcoming"); // "all", "past", "upcoming"
  const calendarRef = useRef(null);

  // Get current user
  const currentUser = useTracker(() => Meteor.user());
  
  // Subscribe to collections
  useEffect(() => {
    const subscriptions = [
      Meteor.subscribe('sessions'),
      Meteor.subscribe("specialists"),
      Meteor.subscribe("participantGroups"),
      Meteor.subscribe("topics"),
    ];
    return () => subscriptions.forEach(sub => sub.stop());
  }, []);

  // Get current specialist info
  const currentSpecialist = useTracker(() => {
    if (!currentUser) return null;
    return SpecialistsCollection.findOne({ userId: currentUser._id });
  });

  // Get all sessions where this specialist is involved
  const allSpecialistSessions = useTracker(() => {
    if (!currentSpecialist) return [];
    
    return SessionsCollection.find({
      $or: [
        { presentingSpecialist: currentSpecialist._id },
        { supportingSpecialist1: currentSpecialist._id },
        { supportingSpecialist2: currentSpecialist._id }
      ]
    }).fetch();
  });

  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());

  // Handle calendar view changes
  const handleDatesSet = (arg) => {
    setCurrentViewDate(new Date(arg.start));
  };

  // Filter sessions based on time period
  const getFilteredSessions = () => {
    const now = new Date();
    
    switch (timePeriodFilter) {
      case "past":
        return allSpecialistSessions.filter(session => 
          new Date(session.dateTime) < now
        ).sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)); // Most recent first
      
      case "upcoming":
        return allSpecialistSessions.filter(session => 
          new Date(session.dateTime) >= now
        ).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)); // Soonest first
      
      case "all":
      default:
        return allSpecialistSessions.sort((a, b) => 
          new Date(a.dateTime) - new Date(b.dateTime)
        ); // Chronological order
    }
  };

  // Get sessions for the current viewed week (for sidebar)
  const getSessionsForCurrentWeek = () => {
    const referenceDate = new Date(currentViewDate);
    
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const filteredSessions = getFilteredSessions();
    
    return filteredSessions.filter(session => {
      const sessionDate = new Date(session.dateTime);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
    });
  };

  const weekSessions = getSessionsForCurrentWeek();
  const filteredSessions = getFilteredSessions();

  // Helper function to get specialist role in session
  const getSpecialistRole = (session, specialistId) => {
    if (session.presentingSpecialist === specialistId) return "Presenting";
    if (session.supportingSpecialist1 === specialistId) return "Supporting 1";
    if (session.supportingSpecialist2 === specialistId) return "Supporting 2";
    return "Unknown";
  };

  // Format week display
  const getWeekDisplayText = () => {
    const referenceDate = new Date(currentViewDate);
    const currentDate = new Date();
    
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const selectedWeekStart = new Date(referenceDate);
    selectedWeekStart.setDate(referenceDate.getDate() - referenceDate.getDay());
    selectedWeekStart.setHours(0, 0, 0, 0);
    
    if (currentWeekStart.getTime() === selectedWeekStart.getTime()) {
      return "This Week";
    }
    
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(selectedWeekStart.getDate() + 6);
    
    const formatOptions = { month: 'short', day: 'numeric' };
    const startStr = selectedWeekStart.toLocaleDateString('en-US', formatOptions);
    const endStr = weekEnd.toLocaleDateString('en-US', formatOptions);
    
    return `${startStr} - ${endStr}`;
  };

  // Get time period display text
  const getTimePeriodText = () => {
    switch (timePeriodFilter) {
      case "past":
        return "Past Sessions";
      case "upcoming":
        return "Upcoming Sessions";
      case "all":
      default:
        return "All Sessions";
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Please log in to view your sessions.</div>
      </div>
    );
  }

  if (!currentSpecialist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Specialist profile not found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-200 text-center py-4">
        <h1 className="text-3xl font-bold text-[#721D35]">
          My Sessions - {currentSpecialist.firstName} {currentSpecialist.lastName}
        </h1>
      </header>

      <div className="flex flex-1">
        {/* Sidebar with session list */}
        <aside className="w-80 bg-white text-black m-4 border border-gray-300 rounded-lg shadow-full-border flex flex-col">
          <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
            <h2 className="text-xl text-white">
              My Sessions - {getWeekDisplayText()}
            </h2>
          </div>
          
          {/* Time Period Filter */}
          <div className="p-4 border-b border-gray-200">
            <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              id="timePeriod"
              value={timePeriodFilter}
              onChange={(e) => setTimePeriodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#721D35] focus:border-[#721D35]"
            >
              <option value="all">All Sessions</option>
              <option value="upcoming">Upcoming Sessions</option>
              <option value="past">Past Sessions</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">
              {getTimePeriodText()} ({filteredSessions.length})
            </h3>
            
            {filteredSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No {timePeriodFilter} sessions found.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => {
                  const isPast = new Date(session.dateTime) < new Date();
                  
                  return (
                    <div 
                      key={session._id}
                      className={`border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow ${
                        isPast ? 'opacity-70' : ''
                      }`}
                      style={{ borderLeft: `4px solid ${session.color || '#721D35'}` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-lg flex-1" style={{ color: session.color || '#721D35' }}>
                          {session.sessionTitle || "Untitled Session"}
                        </div>
                        {isPast && (
                          <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                            Past
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <strong>Date & Time:</strong> {new Date(session.dateTime).toLocaleString()}
                        </div>
                        <div>
                          <strong>My Role:</strong> 
                          <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {getSpecialistRole(session, currentSpecialist._id)}
                          </span>
                        </div>
                        {session.topic && (
                          <div>
                            <strong>Topic:</strong> {topics.find(t => t._id === session.topic)?.name || 'Unknown'}
                          </div>
                        )}
                        {session.participantGroup && (
                          <div>
                            <strong>Group:</strong> {participantGroups.find(pg => pg._id === session.participantGroup)?.name || 'Unknown'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Main calendar area */}
        <main className="flex-1 p-4">
          <div className="bg-white border border-gray-300 rounded-lg shadow-full-border">
            <div className="text-center text-black py-3 px-4 rounded-t-lg">
              <h2 className="text-2xl">My Session Calendar</h2>
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
                events={filteredSessions?.map(session => {
                  const start = new Date(session.dateTime);
                  const end = new Date(start);
                  end.setHours(end.getHours() + 1);
                  
                  return {
                    title: `${session.sessionTitle} (${getSpecialistRole(session, currentSpecialist._id)})`,
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
                      participantGroup: session.participantGroup,
                      topic: session.topic,
                      specialistRole: getSpecialistRole(session, currentSpecialist._id),
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
      </div>
    </div>
  );
};

export default MySessions;