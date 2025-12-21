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
import 'tippy.js/dist/tippy.css';
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
  
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedParticipantGroup, setSelectedParticipantGroup] = useState('');
  const [showSessionsList, setShowSessionsList] = useState(true);

  const [timeframeFilter, setTimeframeFilter] = useState('upcoming');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionsPerPage] = useState(10);

  useEffect(() => {
    const subscriptions = [
      Meteor.subscribe('sessions'),
      Meteor.subscribe("specialists"),
      Meteor.subscribe("participantGroups"),
      Meteor.subscribe("topics"),
    ];
    return () => subscriptions.forEach(sub => sub.stop());
  }, []);

  const sessions = useTracker(() => SessionsCollection.find().fetch());
  const specialists = useTracker(() => SpecialistsCollection.find().fetch());
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());

  // Sort specialists, topics, and participant groups alphabetically
  const sortedSpecialists = [...specialists].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const sortedTopics = [...topics].sort((a, b) => 
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );

  const sortedParticipantGroups = [...participantGroups].sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const getTimeframeRange = (timeframe) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeframe) {
      case 'upcoming':
        return { start: now, end: null };
      case 'past':
        return { start: null, end: now };
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return { start: startOfMonth, end: endOfMonth };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : null,
          end: customEndDate ? new Date(customEndDate + 'T23:59:59') : null
        };
      default:
        return { start: null, end: null };
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSpecialist = !selectedSpecialist || 
      session.presentingSpecialist === selectedSpecialist ||
      session.supportingSpecialist1 === selectedSpecialist ||
      session.supportingSpecialist2 === selectedSpecialist;
    
    const matchesTopic = !selectedTopic || session.topic === selectedTopic || session.presentationTitle === selectedTopic;
    const matchesParticipantGroup = !selectedParticipantGroup || session.participantGroup === selectedParticipantGroup;
    
    const sessionDate = new Date(session.dateTime);
    const { start, end } = getTimeframeRange(timeframeFilter);
    
    let matchesTimeframe = true;
    if (start && sessionDate < start) matchesTimeframe = false;
    if (end && sessionDate > end) matchesTimeframe = false;
    
    return matchesSpecialist && matchesTopic && matchesParticipantGroup && matchesTimeframe;
  });

  const sortedFilteredSessions = [...filteredSessions].sort((a, b) => {
    if (timeframeFilter === 'past') {
      return new Date(b.dateTime) - new Date(a.dateTime);
    }
    return new Date(a.dateTime) - new Date(b.dateTime);
  });

  const totalPages = Math.ceil(sortedFilteredSessions.length / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const endIndex = startIndex + sessionsPerPage;
  const paginatedSessions = sortedFilteredSessions.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSpecialist, selectedTopic, selectedParticipantGroup, timeframeFilter, customStartDate, customEndDate]);

  const getSpecialistName = (specialistId) => {
    if (!specialistId) return 'No specialist';
    const specialist = specialists.find(s => s._id === specialistId);
    return specialist ? `${specialist.firstName} ${specialist.lastName}` : `Specialist ID: ${specialistId}`;
  };

  const getSpecialistColor = (specialistId) => {
    if (!specialistId) return '#000000';
    const specialist = specialists.find(s => s._id === specialistId);
    return specialist ? (specialist.nameColor || '#000000') : '#000000';
  };

  const getTopicName = (topicId) => {
    if (!topicId) return 'No topic';
    const topic = topics.find(t => t._id === topicId);
    return topic ? topic.title : `Topic ID: ${topicId}`;
  };

  const getParticipantGroupName = (groupId) => {
    if (!groupId) return 'No group';
    const group = participantGroups.find(g => g._id === groupId);
    return group ? group.name : `Group ID: ${groupId}`;
  };

  const getParticipantGroupColor = (groupId) => {
    if (!groupId) return '#000000';
    const group = participantGroups.find(g => g._id === groupId);
    return group ? (group.nameColor || '#000000') : '#000000';
  };

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

    const scheduleWindow = window.open('', '_blank');
    const scheduleHTML = `
      <html>
        <head>
          <title>Schedule for ${specialistName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-left; }
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
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${specialistSessions.map(session => {
                const date = new Date(session.dateTime);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const formattedDateTime = `${formattedDate} at ${formattedTime}`;
                
                let role = '';
                if (session.presentingSpecialist === selectedSpecialist) role = 'Presenting';
                else if (session.supportingSpecialist1 === selectedSpecialist) role = 'Supporting 1';
                else if (session.supportingSpecialist2 === selectedSpecialist) role = 'Supporting 2';
                
                return `
                  <tr>
                    <td>${formattedDateTime}</td>
                    <td>${session.sessionTitle}</td>
                    <td>${getTopicName(session.topic || session.presentationTitle)}</td>
                    <td>${getParticipantGroupName(session.participantGroup)}</td>
                    <td class="role">${role}</td>
                    <td class="notes">${session.notes || ''}</td>
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

  const handlePrint = (option) => {
    console.log(`Printing option: ${option}`);
    
    if (option.includes("Semester") || option.includes("by Semester") || option.includes("Presentation Title")) {
      console.log("Semester-based report detected, fetching all data...");
      Meteor.call("exportExcelByOption", option, null, null, (error, base64) => {
        if (error) {
          console.error("Error exporting Excel:", error);
          toast.error(`Failed to export ${option}: ${error.reason || error.message}`);
        } else {
          console.log("Export successful, downloading file...");
          downloadExcelFile(base64, option);
        }
      });
    } else {
      console.log("Weekly-based report detected, using date range...");
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);
      const lastDayOfWeek = new Date(today);
      lastDayOfWeek.setDate(today.getDate() - today.getDay() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);
      
      Meteor.call("exportExcelByOption", option, firstDayOfWeek, lastDayOfWeek, (error, base64) => {
        if (error) {
          console.error("Error exporting Excel:", error);
          toast.error(`Failed to export ${option}: ${error.reason || error.message}`);
        } else {
          downloadExcelFile(base64, option);
        }
      });
    }
  };

  const downloadExcelFile = (base64, filename) => {
    try {
      console.log(`Downloading file: ${filename}.xlsx`);
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${filename}.xlsx downloaded successfully`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };
 
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

  const handleEventDrop = (info) => {
    const sessionId = info.event.extendedProps.sessionId;
    const session = sessions.find(s => s._id === sessionId)

    if (!session) return;

    const oldDate = new Date(session.dateTime);
    const newDateFromDrop = info.event.start;

    const updatedDateTime = new Date(
      newDateFromDrop.getFullYear(),
      newDateFromDrop.getMonth(),
      newDateFromDrop.getDate(),
      newDateFromDrop.getHours(),
      newDateFromDrop.getMinutes(),
      newDateFromDrop.getSeconds()
    );
    session.dateTime = updatedDateTime
    handleSubmit(session, sessionId);
  };
  
  const handleSubmit = (formData, sessionId) => {
    if (sessionId) {
      Meteor.call('sessions.update', sessionId, formData, (error) => {
        if (error) {
          toast.error(error.reason || 'An error occurred');
        } else {
          toast.success('Session updated successfully');
        }
      });
    } else {
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
            "Presentation Title, Topic, Category",
            "Semesters by Agency",
            "Topics by Participant Groups",
          ]}
        />

        <main className="flex-1 p-4 flex gap-4">
          <div className={`${showSessionsList ? 'w-3/5' : 'w-full'} rounded-lg shadow-full-border`}>
            <header className="bg-white text-grey text-center py-3 rounded-t-lg border border-b-0 border-gray-300">
                <h1 className="text-3xl">Sessions Calendar</h1>
            </header>
            <div className="bg-white rounded-b-lg border border-gray-300 p-2 h-[calc(100vh-145px)]">

              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                firstDay={1}
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
                    title: session.sessionNumber ? `#${session.sessionNumber} ${session.sessionTitle}` : session.sessionTitle,
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
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    value={timeframeFilter}
                    onChange={(e) => setTimeframeFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                  >
                    <option value="upcoming">Upcoming Sessions</option>
                    <option value="past">Past Sessions</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="custom">Custom Range</option>
                    <option value="all">All Sessions</option>
                  </select>

                  {timeframeFilter === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Date</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
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
                      {sortedSpecialists.map(specialist => (
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
                      {sortedTopics.map(topic => (
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
                      {sortedParticipantGroups.map(group => (
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
                        setTimeframeFilter('upcoming');
                        setCustomStartDate('');
                        setCustomEndDate('');
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

              <div className="p-4 h-[calc(100vh-500px)] overflow-y-auto">
                <div className="mb-3 text-sm text-gray-600">
                  Showing {paginatedSessions.length} of {sortedFilteredSessions.length} sessions
                  {sortedFilteredSessions.length !== sessions.length && ` (${sessions.length} total)`}
                </div>
                
                <div className="space-y-3">
                  {paginatedSessions.map(session => {
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
                              {session.sessionNumber && `#${session.sessionNumber} `}{session.sessionTitle}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>📅 {formattedDate} at {formattedTime}</div>
                              <div>📚 {session.presentationTitle ? getTopicName(session.presentationTitle) : (session.topic ? getTopicName(session.topic) : 'No topic assigned')}</div>
                              <div>
                                👥 <span style={{ color: getParticipantGroupColor(session.participantGroup), fontWeight: '500' }}>
                                  {session.participantGroup ? getParticipantGroupName(session.participantGroup) : 'No group assigned'}
                                </span>
                              </div>
                              <div>
                                🎯 <span style={{ color: getSpecialistColor(session.presentingSpecialist), fontWeight: '500' }}>
                                  {session.presentingSpecialist ? getSpecialistName(session.presentingSpecialist) : 'No specialist assigned'}
                                </span>
                              </div>
                              {session.supportingSpecialist1 && (
                                <div>
                                  🤝 <span style={{ color: getSpecialistColor(session.supportingSpecialist1), fontWeight: '500' }}>
                                    {getSpecialistName(session.supportingSpecialist1)} (Support)
                                  </span>
                                </div>
                              )}
                              {session.supportingSpecialist2 && (
                                <div>
                                  🤝 <span style={{ color: getSpecialistColor(session.supportingSpecialist2), fontWeight: '500' }}>
                                    {getSpecialistName(session.supportingSpecialist2)} (Support)
                                  </span>
                                </div>
                              )}
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

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === 1 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded text-sm ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === totalPages 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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