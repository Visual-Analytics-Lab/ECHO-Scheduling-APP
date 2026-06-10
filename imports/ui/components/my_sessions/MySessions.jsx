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

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const MySessions = () => {
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [timePeriodFilter, setTimePeriodFilter] = useState("upcoming");
  const calendarRef = useRef(null);

  const currentUser = useTracker(() => Meteor.user());
  
  useEffect(() => {
    const subscriptions = [
      Meteor.subscribe('sessions'),
      Meteor.subscribe("specialists"),
      Meteor.subscribe("participantGroups"),
      Meteor.subscribe("topics"),
    ];
    return () => subscriptions.forEach(sub => sub.stop());
  }, []);

  const currentSpecialist = useTracker(() => {
    if (!currentUser) return null;
    const userEmail = currentUser.emails?.[0]?.address;
    if (userEmail) {
      return SpecialistsCollection.findOne({ email: userEmail });
    }
    return SpecialistsCollection.findOne({ userId: currentUser._id });
  });

  const allSpecialistSessions = useTracker(() => {
    if (!currentSpecialist) return [];
    
    return SessionsCollection.find({
      $or: [
        { presentingSpecialist: currentSpecialist._id },
        { supportingSpecialist1: currentSpecialist._id },
        { supportingSpecialist2: currentSpecialist._id },
        { supportingSpecialist3: currentSpecialist._id },
        { supportingSpecialist4: currentSpecialist._id },
      ]
    }).fetch();
  });

  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());

  const handleDatesSet = (arg) => {
    setCurrentViewDate(new Date(arg.start));
  };

  const getFilteredSessions = () => {
    const now = new Date();
    
    switch (timePeriodFilter) {
      case "past":
        return allSpecialistSessions.filter(session => 
          new Date(session.dateTime) < now
        ).sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
      
      case "upcoming":
        return allSpecialistSessions.filter(session => 
          new Date(session.dateTime) >= now
        ).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      
      case "all":
      default:
        return allSpecialistSessions.sort((a, b) => 
          new Date(a.dateTime) - new Date(b.dateTime)
        );
    }
  };

  const filteredSessions = getFilteredSessions();

  const getSpecialistRole = (session, specialistId) => {
    if (session.presentingSpecialist === specialistId) return "Presenting";
    if (session.supportingSpecialist1 === specialistId) return "Supporting 1";
    if (session.supportingSpecialist2 === specialistId) return "Supporting 2";
    if (session.supportingSpecialist3 === specialistId) return "Supporting 3";
    if (session.supportingSpecialist4 === specialistId) return "Supporting 4";
    return "Unknown";
  };

  const getTimePeriodText = () => {
    switch (timePeriodFilter) {
      case "past": return "Past Sessions";
      case "upcoming": return "Upcoming Sessions";
      case "all": default: return "All Sessions";
    }
  };

  const getTopicName = (session) => {
    const topicId = session.presentationTitle || session.topic;
    if (!topicId) return 'No topic assigned';
    const topic = topics.find(t => t._id === topicId);
    return topic?.title || 'No topic assigned';
  };

  const downloadSessionsPDF = () => {
    try {
      if (!currentSpecialist) {
        alert("Specialist profile not found.");
        return;
      }

      // Use landscape for more space
      const doc = new jsPDF({ orientation: 'landscape' });
      
      doc.setFontSize(18);
      doc.setTextColor(114, 29, 53);
      doc.text(`My Sessions - ${currentSpecialist.firstName} ${currentSpecialist.lastName}`, 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`${getTimePeriodText()} (${filteredSessions.length} total)`, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);
      
      const tableData = filteredSessions.map((session) => {
        const topicName = getTopicName(session);
        const group = participantGroups.find(pg => pg._id === session.participantGroup);
        const role = getSpecialistRole(session, currentSpecialist._id);
        const isPast = new Date(session.dateTime) < new Date();
        
        return [
          session.sessionTitle || "Untitled Session",
          new Date(session.dateTime).toLocaleString(),
          role,
          topicName,
          group?.name || "N/A",
          session.notes || "No objectives listed",
          isPast ? "Past" : "Upcoming"
        ];
      });
      
      doc.autoTable({
        head: [['Session Title', 'Date & Time', 'My Role', 'Topic', 'Group', 'Notes/Objectives', 'Status']],
        body: tableData,
        startY: 40,
        theme: 'striped',
        headStyles: {
          fillColor: [114, 29, 53],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          valign: 'top'
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 35 },
          2: { cellWidth: 22 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
          5: { cellWidth: 70 }, // Notes column extra wide
          6: { cellWidth: 18 }
        },
        margin: { top: 40 }
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      const fileName = `MySessions_${currentSpecialist.firstName}_${currentSpecialist.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please check the console for details.");
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
        <div className="text-xl">No specialist profile linked to your account.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gray-200 text-center py-4">
        <h1 className="text-3xl font-bold text-[#721D35]">
          My Sessions - {currentSpecialist.firstName} {currentSpecialist.lastName}
        </h1>
      </header>

      <div className="flex flex-1">
        <aside className="w-80 bg-white text-black m-4 border border-gray-300 rounded-lg shadow-full-border flex flex-col">
          <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
            <h2 className="text-xl text-white">My Sessions</h2>
          </div>
          
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

          <div className="px-4 pt-3 pb-2">
            <button
              onClick={downloadSessionsPDF}
              className="w-full px-4 py-2 bg-[#721D35] text-white rounded-md hover:bg-[#5a1729] transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filteredSessions.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>

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
                      className={`border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow ${isPast ? 'opacity-70' : ''}`}
                      style={{ borderLeft: `4px solid ${session.color || '#721D35'}` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-lg flex-1" style={{ color: session.color || '#721D35' }}>
                          {session.sessionTitle || "Untitled Session"}
                        </div>
                        {isPast && (
                          <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">Past</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Date & Time:</strong> {new Date(session.dateTime).toLocaleString()}</div>
                        <div>
                          <strong>My Role:</strong> 
                          <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {getSpecialistRole(session, currentSpecialist._id)}
                          </span>
                        </div>
                        <div>
                          <strong>Topic:</strong> {getTopicName(session)}
                        </div>
                        {session.participantGroup && (
                          <div>
                            <strong>Group:</strong> {participantGroups.find(pg => pg._id === session.participantGroup)?.name || 'Unknown'}
                          </div>
                        )}
                        {session.notes && (
                          <div>
                            <strong>Notes/Objectives:</strong>
                            <div className="mt-1 text-gray-500 text-xs whitespace-pre-wrap">
                              {session.notes}
                            </div>
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
                firstDay={1}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="100%"
                slotMinTime="07:00:00"
                slotMaxTime="19:00:00"
                scrollTime="08:00:00"
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
                      supportingSpecialist3: session.supportingSpecialist3,
                      supportingSpecialist4: session.supportingSpecialist4,
                      participantGroup: session.participantGroup,
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
      </div>
    </div>
  );
};

export default MySessions;