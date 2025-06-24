import React, { useState, useEffect } from "react";
import { useTracker } from 'meteor/react-meteor-data';
import SessionModal from "./SessionModal";
import Navbar from "../navbar/Navbar";
import CalendarSidebar from "./CalendarSidebar";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // ensure styles are bundled
import 'tippy.js/dist/border.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

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
import { Meteor } from "meteor/meteor";
import { printExcel } from "./Printing";

const CalendarPage = () => {
  const [activeOption, setActiveOption] = useState("Print Option 1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // New filtering states
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedParticipantGroup, setSelectedParticipantGroup] = useState('');
  const [showSessionsList, setShowSessionsList] = useState(true);

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

  // Filter sessions based on selected filters
  const filteredSessions = sessions.filter(session => {
    const matchesSpecialist = !selectedSpecialist || 
      session.presentingSpecialist === selectedSpecialist ||
      session.supportingSpecialist1 === selectedSpecialist ||
      session.supportingSpecialist2 === selectedSpecialist;
    
    const matchesTopic = !selectedTopic || session.topic === selectedTopic;
    const matchesParticipantGroup = !selectedParticipantGroup || session.participantGroup === selectedParticipantGroup;
    
    return matchesSpecialist && matchesTopic && matchesParticipantGroup;
  });

  // Sort filtered sessions by date
  const sortedFilteredSessions = [...filteredSessions].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  // Get topic name by ID - with better error handling
  const getTopicName = (topicId) => {
    if (!topicId) return 'No topic';
    const topic = topics.find(t => t._id === topicId);
    return topic ? topic.title : `Topic ID: ${topicId}`;
  };

  // Get participant group name by ID - with better error handling
  const getParticipantGroupName = (groupId) => {
    if (!groupId) return 'No group';
    const group = participantGroups.find(g => g._id === groupId);
    return group ? group.name : `Group ID: ${groupId}`;
  };

  // Get specialist name by ID - with better error handling
  const getSpecialistName = (specialistId) => {
    if (!specialistId) return 'No specialist';
    const specialist = specialists.find(s => s._id === specialistId);
    return specialist ? `${specialist.firstName} ${specialist.lastName}` : `Specialist ID: ${specialistId}`;
  };

  // Generate specialist schedule for printing/export
  const generateSpecialistSchedule = () => {
    if (!selectedSpecialist) {
      toast.error('Please select a specialist first');
      return;
    }

    const specialistName = getSpecialistName(selectedSpecialist);
    const specialistSessions = filteredSessions.filter(session => 
      session.presentingSpecialist === selectedSpecialist ||
      session.supportingSpecialist1 === selectedSpecialist ||
      session.supportingSpecialist2 === selectedSpecialist
    ).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    // Create printable schedule
    const scheduleWindow = window.open('', '_blank');
    const scheduleHTML = `
      <html>
        <head>
          <title>Schedule for ${specialistName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .role { font-weight: bold; color: #666; }
          </style>
        </head>
        <body>
          <h1>Schedule for ${specialistName}</h1>
          <p><strong>Total Sessions:</strong> ${specialistSessions.length}</p>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Session Title</th>
                <th>Topic</th>
                <th>Participant Group</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${specialistSessions.map(session => {
                const date = new Date(session.dateTime);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                let role = '';
                if (session.presentingSpecialist === selectedSpecialist) role = 'Presenting';
                else if (session.supportingSpecialist1 === selectedSpecialist) role = 'Supporting 1';
                else if (session.supportingSpecialist2 === selectedSpecialist) role = 'Supporting 2';
                
                return `
                  <tr>
                    <td>${formattedDate} at ${formattedTime}</td>
                    <td>${session.sessionTitle}</td>
                                                    <td>${getTopicName(session.topic)}</td>
                    <td>${getParticipantGroupName(session.participantGroup)}</td>
                    <td class="role">${role}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    scheduleWindow.document.write(scheduleHTML);
    scheduleWindow.document.close();
  };

  const handleSidebarClick = (option) => {
    setActiveOption(option);
    handlePrint(option);
  };
 
  // When clicking to create new event, populate date field with selected
  const handleDateClick = (info) => {
    setSelectedDate(info.start);
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    const sessionId = info.event.extendedProps.sessionId;
    const session = sessions.find(s => s._id === sessionId);
    if (session) {
      setSelectedSession(session);
      setIsModalOpen(true);
    }
  };

  // Handle dragging event to a new day
  const handleEventDrop = (info) => {
    const sessionId = info.event.extendedProps.sessionId;
    const session = sessions.find(s => s._id === sessionId)

    if (!session) return;

    const oldDate = new Date(session.dateTime);
    const newDateFromDrop = info.event.start;

    // Create a new Date with the new day, but same time
    const updatedDateTime = new Date(
      newDateFromDrop.getFullYear(),
      newDateFromDrop.getMonth(),
      newDateFromDrop.getDate(),
      newDateFromDrop.getHours(),
      newDateFromDrop.getMinutes(),
      newDateFromDrop.getSeconds()
      // oldDate.getHours(),
      // oldDate.getMinutes(),
      // oldDate.getSeconds()
    );
    session.dateTime = updatedDateTime
    handleSubmit(session, sessionId);
  };

  const handlePrint = (option) => {
    printExcel(option);
  };  
  
  const handleSubmit = (formData, sessionId) => {
    if (sessionId) {
      // Update existing session
      Meteor.call('sessions.update', sessionId, formData, (error) => {
        if (error) {
          toast.error(error.reason || 'An error occurred');
        } else {
          toast.success('Session updated successfully');
        }
      });
    } else {
      // Create new session
      Meteor.call('sessions.insert', formData, (error) => {
        if (error) {
          toast.error(error.reason || 'An error occurred');
        } else {
          toast.success('Session created successfully');
        }
      });
    }
  };
  
  const handleDelete = (sessionId) => {
    Meteor.call('sessions.remove', sessionId, (error) => {
      if (error) {
        toast.error(error.reason || 'An error occurred');
      } else {
        toast.success('Session deleted successfully');
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-1">
        <CalendarSidebar 
          activeOption={activeOption} 
          onOptionSelect={handleSidebarClick}
          options={[
            "Schedules by Week",
            "Schedules by Participant Groups",
            "Participant Groups by Semester",
            "Specialists by Semester",
            "Topics by Semester",
            "Semesters by Agency",
            "Topics by Participant Groups",
          ]}
        />

        <main className="flex-1 p-4 flex gap-4">
          {/* Calendar Section */}
          <div className={`${showSessionsList ? 'w-3/5' : 'w-full'} rounded-lg shadow-full-border`}>
            <header className="bg-white text-grey text-center py-3 rounded-t-lg border border-b-0 border-gray-300">
                <h1 className="text-3xl">Sessions Calendar</h1>
            </header>
            <div className="bg-white rounded-b-lg border border-gray-300 p-2 h-[calc(100vh-145px)]">

              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height="100%"
                editable={true}
                selectable={true}
                select={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                events={filteredSessions?.map(session => {
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
              />

              <SessionModal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedSession(null);
                }}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                selectedDate={selectedDate}
                existingSession={selectedSession}
              />
            </div>
          </div>

          {/* Sessions List Section */}
          {showSessionsList && (
            <div className="w-2/5 bg-white rounded-lg shadow-full-border border border-gray-300">
              <div className="bg-white rounded-t-lg border-b border-gray-300 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Sessions Filter & List</h2>
                  <button
                    onClick={() => setShowSessionsList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Filters */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialist
                    </label>
                    <select
                      value={selectedSpecialist}
                      onChange={(e) => setSelectedSpecialist(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Specialists</option>
                      {specialists.map(specialist => (
                        <option key={specialist._id} value={specialist._id}>
                          {specialist.firstName} {specialist.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Topics</option>
                      {topics.map(topic => (
                        <option key={topic._id} value={topic._id}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Participant Group
                    </label>
                    <select
                      value={selectedParticipantGroup}
                      onChange={(e) => setSelectedParticipantGroup(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Groups</option>
                      {participantGroups.map(group => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSpecialist('');
                        setSelectedTopic('');
                        setSelectedParticipantGroup('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={generateSpecialistSchedule}
                      disabled={!selectedSpecialist}
                      className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                        selectedSpecialist 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Print Schedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Sessions List */}
              <div className="p-4 h-[calc(100vh-400px)] overflow-y-auto">
                <div className="mb-3 text-sm text-gray-600">
                  Showing {sortedFilteredSessions.length} of {sessions.length} sessions
                  {/* Debug info - remove this later */}
                  <div className="text-xs text-gray-400 mt-1">
                    Topics loaded: {topics.length} | Specialists: {specialists.length} | Groups: {participantGroups.length}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {sortedFilteredSessions.map(session => {
                    const date = new Date(session.dateTime);
                    const formattedDate = date.toLocaleDateString();
                    const formattedTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    
                    return (
                      <div
                        key={session._id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {session.sessionTitle}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>📅 {formattedDate} at {formattedTime}</div>
                              <div>📚 {session.topic ? getTopicName(session.topic) : 'No topic assigned'}</div>
                              <div>👥 {session.participantGroup ? getParticipantGroupName(session.participantGroup) : 'No group assigned'}</div>
                              <div>🎯 {session.presentingSpecialist ? getSpecialistName(session.presentingSpecialist) : 'No specialist assigned'}</div>
                            </div>
                          </div>
                          <div
                            className="w-4 h-4 rounded-full ml-2 mt-1"
                            style={{ backgroundColor: session.color }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {sortedFilteredSessions.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No sessions match the selected filters
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toggle button when sessions list is hidden */}
          {!showSessionsList && (
            <button
              onClick={() => setShowSessionsList(true)}
              className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-3 rounded-l-lg shadow-lg hover:bg-blue-600 transition-colors"
            >
              📋
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;