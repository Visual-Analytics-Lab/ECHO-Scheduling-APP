import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import {
  UsersCollection,
  SpecialistsCollection,
  ParticipantGroupsCollection,
  TopicsCollection,
  SimpleTopicsCollection,
  RolesCollection,
  SemesterCollection,
  SeriesCollection,
  CategoriesCollection,
  SessionsCollection
} from '../../../api/collections';
import { Meteor } from 'meteor/meteor';
import { MdEdit } from 'react-icons/md';
import DeleteModal from '../delete_modal/DeleteModal'


const SessionModal = ({ isOpen, onClose, onSubmit, onDelete, selectedDate, existingSession = null}) => {
  useEffect(() => {
    const subscriptions = [
      Meteor.subscribe("users"),
      Meteor.subscribe("roles"),
      Meteor.subscribe("specialists"),
      Meteor.subscribe("participantGroups"),
      Meteor.subscribe("semesters"),
      Meteor.subscribe("series"),
      Meteor.subscribe("topics"),
      Meteor.subscribe("simpleTopics"),
      Meteor.subscribe("categories"),
      Meteor.subscribe("sessions"),
    ];
    return () => subscriptions.forEach(sub => sub.stop());
  }, []);

  const users = useTracker(() => Meteor.users.find().fetch());
  const adminRoleId = useTracker(() => {
    const role = RolesCollection.findOne({ title: 'Admin' });
    return role ? role._id : null;
  });
  const specialists = useTracker(() => SpecialistsCollection.find().fetch());
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  const semesters = useTracker(() => SemesterCollection.find().fetch());
  const series = useTracker(() => SeriesCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());
  const simpleTopics = useTracker(() => SimpleTopicsCollection.find().fetch());
  const roles = useTracker(() => RolesCollection.find().fetch());
  const categories = useTracker(() => CategoriesCollection.find().fetch());

  const [formData, setFormData] = useState({
    sessionNumber: '',
    sessionTitle: '',
    casePresenter: '',
    facilitator: '',
    supportingFacilitator: '',
    presentingSpecialist: '',
    supportingSpecialist1: '',
    supportingSpecialist2: '',
    supportingSpecialist3: '',
    supportingSpecialist4: '',
    participantGroup: '',
    dateTime: '',
    presentationsDue: '',
    newMaterial: false,
    color: '',
    presentationTitle: '',
    topicSimple: '',
    category: '',
    notes: '',
    semester: '',
    series: '',
    isRecurring: false,
    recurrenceCount: 2,
    recurrenceInterval: 'weekly',
    blankFieldsOnRecurrence: false
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPartOfRecurringGroup, setIsPartOfRecurringGroup] = useState(false);
  const [recurringGroupCount, setRecurringGroupCount] = useState(0);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showEditRecurringOptions, setShowEditRecurringOptions] = useState(false);
  const [showRescheduleOptions, setShowRescheduleOptions] = useState(false);
  const [newRescheduleInterval, setNewRescheduleInterval] = useState('weekly');
  const [presentationTitleSearchQuery, setPresentationTitleSearchQuery] = useState('');
  const [showPresentationTitleDropdown, setShowPresentationTitleDropdown] = useState(false);
  const presentationTitleDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (presentationTitleDropdownRef.current && !presentationTitleDropdownRef.current.contains(event.target)) {
        setShowPresentationTitleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (existingSession) {
      const isRecurring = !!existingSession.recurringGroupId;
      setIsPartOfRecurringGroup(isRecurring);
      
      if (isRecurring) {
        const groupSessions = SessionsCollection.find({ 
          recurringGroupId: existingSession.recurringGroupId 
        }).fetch();
        setRecurringGroupCount(groupSessions.length);
      }

      setFormData({
        sessionNumber: existingSession.sessionNumber || '',
        sessionTitle: existingSession.sessionTitle || '',
        casePresenter: existingSession.casePresenter || '',
        facilitator: existingSession.facilitator || '',
        supportingFacilitator: existingSession.supportingFacilitator || '',
        presentingSpecialist: existingSession.presentingSpecialist || '',
        supportingSpecialist1: existingSession.supportingSpecialist1 || '',
        supportingSpecialist2: existingSession.supportingSpecialist2 || '',
        supportingSpecialist3: existingSession.supportingSpecialist3 || '',
        supportingSpecialist4: existingSession.supportingSpecialist4 || '',
        participantGroup: existingSession.participantGroup || '',
        dateTime: formatLocalDateTime(existingSession.dateTime),
        presentationsDue: formatLocalDateTime(existingSession.presentationsDue),
        newMaterial: existingSession.newMaterial || false,
        color: existingSession.color || '',
        presentationTitle: existingSession.presentationTitle || existingSession.topic || '',
        topicSimple: existingSession.topicSimple || '',
        category: existingSession.category || '',
        notes: existingSession.notes || '',
        semester: existingSession.semester || '',
        series: existingSession.series || '',
        isRecurring: false,
        recurrenceCount: 2,
        recurrenceInterval: 'weekly',
        blankFieldsOnRecurrence: false
      });
      const selectedTopic = topics.find(t => t._id === (existingSession.presentationTitle || existingSession.topic));
      if (selectedTopic) {
        setPresentationTitleSearchQuery(selectedTopic.title);
      }
    } else {
      setIsPartOfRecurringGroup(false);
      setRecurringGroupCount(0);
      setShowRescheduleOptions(false);
      setFormData({
        sessionNumber: '',
        sessionTitle: '',
        casePresenter: '',
        facilitator: '',
        supportingFacilitator: '',
        presentingSpecialist: '',
        supportingSpecialist1: '',
        supportingSpecialist2: '',
        supportingSpecialist3: '',
        supportingSpecialist4: '',
        participantGroup: '',
        dateTime: formatLocalDateTime(selectedDate),
        presentationsDue: formatLocalDateTime(getTwoBusinessDaysBefore(selectedDate)),
        newMaterial: false,
        color: '',
        presentationTitle: '',
        topicSimple: '',
        category: '',
        notes: '',
        semester: '',
        series: '',
        isRecurring: false,
        recurrenceCount: 2,
        recurrenceInterval: 'weekly',
        blankFieldsOnRecurrence: false
      });
      setPresentationTitleSearchQuery('');
    }
  }, [existingSession, selectedDate]);

  const getSpecialistTopics = (specialistId) => {
    if (!specialistId) return [];
    return topics.filter(topic => 
      topic.specialists_ids && topic.specialists_ids.includes(specialistId)
    );
  };

  const getFilteredTopics = () => {
    if (!presentationTitleSearchQuery) return [];
    
    const query = presentationTitleSearchQuery.toLowerCase();
    let filtered = topics.filter(topic => 
      topic.title.toLowerCase().includes(query)
    );

    if (formData.presentingSpecialist) {
      const specialistTopics = filtered.filter(topic => 
        topic.specialists_ids && topic.specialists_ids.includes(formData.presentingSpecialist)
      );
      const otherTopics = filtered.filter(topic => 
        !topic.specialists_ids || !topic.specialists_ids.includes(formData.presentingSpecialist)
      );
      filtered = [...specialistTopics, ...otherTopics];
    }

    return filtered;
  };

  const formatLocalDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getTwoBusinessDaysBefore = (dateString) => {
    const date = new Date(dateString);
    let businessDaysToSubtract = 2;
    let currentDate = new Date(date);
    while (businessDaysToSubtract > 0) {
      currentDate.setDate(currentDate.getDate() - 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysToSubtract--;
      }
    }
    return currentDate;
  };

  const copyHexToClipboard = () => {
    const hexValue = formData.color || '#0ea6b2';
    navigator.clipboard.writeText(hexValue).then(() => {
      alert(`HEX color ${hexValue} copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePresentationTitleSearchChange = (e) => {
    const value = e.target.value;
    setPresentationTitleSearchQuery(value);
    setShowPresentationTitleDropdown(true);
    setFormData(prev => ({ ...prev, presentationTitle: '' }));
  };

  const handlePresentationTitleSelect = (topicId, topicTitle) => {
    setFormData(prev => ({ ...prev, presentationTitle: topicId }));
    setPresentationTitleSearchQuery(topicTitle);
    setShowPresentationTitleDropdown(false);
  };

  const handleCreateNewPresentationTitle = () => {
    if (!presentationTitleSearchQuery.trim()) return;
    Meteor.call('topics.insert', { 
      title: presentationTitleSearchQuery.trim(),
      specialists_ids: formData.presentingSpecialist ? [formData.presentingSpecialist] : []
    }, (error, result) => {
      if (error) {
        console.error('Error creating presentation title:', error);
        alert('Error creating presentation title: ' + (error.reason || error.message));
      } else {
        setFormData(prev => ({ ...prev, presentationTitle: result }));
        setShowPresentationTitleDropdown(false);
      }
    });
  };

  // Reschedule all FUTURE sessions in the recurring group with a new interval
  const handleRescheduleFutureOccurrences = () => {
    if (!existingSession?.recurringGroupId) return;

    const now = new Date();

    // Get all sessions in the group, sorted by date
    const allGroupSessions = SessionsCollection.find(
      { recurringGroupId: existingSession.recurringGroupId },
      { sort: { dateTime: 1 } }
    ).fetch();

    // Split into past and future
    const futureSessions = allGroupSessions.filter(s => new Date(s.dateTime) >= now);

    if (futureSessions.length === 0) {
      alert('No future sessions to reschedule!');
      return;
    }

    if (!window.confirm(`This will reschedule ${futureSessions.length} future sessions to repeat every ${newRescheduleInterval}. Past sessions will not be changed. Continue?`)) {
      return;
    }

    // Use the first future session as the anchor date
    const anchorDate = new Date(futureSessions[0].dateTime);

    // Calculate new dates for each future session
    futureSessions.forEach((session, index) => {
      const newDate = new Date(anchorDate);

      if (newRescheduleInterval === 'daily') {
        newDate.setDate(anchorDate.getDate() + index);
      } else if (newRescheduleInterval === 'weekly') {
        newDate.setDate(anchorDate.getDate() + (index * 7));
      } else if (newRescheduleInterval === 'biweekly') {
        newDate.setDate(anchorDate.getDate() + (index * 14));
      } else if (newRescheduleInterval === 'monthly') {
        newDate.setMonth(anchorDate.getMonth() + index);
      }

      Meteor.call('sessions.update', session._id, { 
        ...session,
        dateTime: newDate 
      }, (error) => {
        if (error) {
          console.error('Error rescheduling session:', error);
        }
      });
    });

    alert(`Successfully rescheduled ${futureSessions.length} future sessions!`);
    setShowRescheduleOptions(false);
    onClose();
  };

  const handleSubmit = (editAllOccurrences = false) => {
    if (editAllOccurrences && existingSession?.recurringGroupId) {
      const dataToUpdate = {
        sessionNumber: formData.sessionNumber,
        sessionTitle: formData.sessionTitle,
        casePresenter: formData.casePresenter,
        facilitator: formData.facilitator,
        supportingFacilitator: formData.supportingFacilitator,
        presentingSpecialist: formData.presentingSpecialist,
        supportingSpecialist1: formData.supportingSpecialist1,
        supportingSpecialist2: formData.supportingSpecialist2,
        supportingSpecialist3: formData.supportingSpecialist3,
        supportingSpecialist4: formData.supportingSpecialist4,
        participantGroup: formData.participantGroup,
        newMaterial: formData.newMaterial,
        color: formData.color,
        presentationTitle: formData.presentationTitle,
        topicSimple: formData.topicSimple,
        category: formData.category,
        notes: formData.notes,
        semester: formData.semester,
        series: formData.series,
      };

      Meteor.call('sessions.updateRecurringGroup', existingSession.recurringGroupId, dataToUpdate, (error) => {
        if (error) {
          alert('Error updating recurring sessions: ' + (error.reason || error.message));
        } else {
          alert(`Successfully updated all ${recurringGroupCount} sessions in this recurring group!`);
          setFormData({});
          setPresentationTitleSearchQuery('');
          setShowEditRecurringOptions(false);
          onClose();
        }
      });
      return;
    }

    if (formData.isRecurring && formData.recurrenceCount > 1) {
      const baseDate = new Date(formData.dateTime);
      const basePresentationsDue = formData.presentationsDue ? new Date(formData.presentationsDue) : null;
      const recurringGroupId = `recurring-${Date.now()}`;

      for (let i = 0; i < formData.recurrenceCount; i++) {
        const sessionDate = new Date(baseDate);
        let presentationsDueDate = basePresentationsDue ? new Date(basePresentationsDue) : null;

        if (formData.recurrenceInterval === 'daily') {
          sessionDate.setDate(baseDate.getDate() + i);
          if (presentationsDueDate) presentationsDueDate.setDate(basePresentationsDue.getDate() + i);
        } else if (formData.recurrenceInterval === 'weekly') {
          sessionDate.setDate(baseDate.getDate() + (i * 7));
          if (presentationsDueDate) presentationsDueDate.setDate(basePresentationsDue.getDate() + (i * 7));
        } else if (formData.recurrenceInterval === 'biweekly') {
          sessionDate.setDate(baseDate.getDate() + (i * 14));
          if (presentationsDueDate) presentationsDueDate.setDate(basePresentationsDue.getDate() + (i * 14));
        } else if (formData.recurrenceInterval === 'monthly') {
          sessionDate.setMonth(baseDate.getMonth() + i);
          if (presentationsDueDate) presentationsDueDate.setMonth(basePresentationsDue.getMonth() + i);
        }

        const dataToSubmit = {
          dateTime: sessionDate,
          presentationsDue: presentationsDueDate,
          participantGroup: formData.participantGroup,
          color: formData.color,
          semester: formData.semester,
          series: formData.series,
          recurringGroupId: recurringGroupId,
          ...(i === 0 || !formData.blankFieldsOnRecurrence ? {
            sessionNumber: formData.sessionNumber,
            sessionTitle: formData.sessionTitle,
            casePresenter: formData.casePresenter,
            facilitator: formData.facilitator,
            supportingFacilitator: formData.supportingFacilitator,
            presentingSpecialist: formData.presentingSpecialist,
            supportingSpecialist1: formData.supportingSpecialist1,
            supportingSpecialist2: formData.supportingSpecialist2,
            supportingSpecialist3: formData.supportingSpecialist3,
            supportingSpecialist4: formData.supportingSpecialist4,
            newMaterial: formData.newMaterial,
            presentationTitle: formData.presentationTitle,
            topicSimple: formData.topicSimple,
            category: formData.category,
            notes: formData.notes,
          } : {
            sessionNumber: '',
            sessionTitle: '',
            casePresenter: '',
            facilitator: '',
            supportingFacilitator: '',
            presentingSpecialist: '',
            supportingSpecialist1: '',
            supportingSpecialist2: '',
            supportingSpecialist3: '',
            supportingSpecialist4: '',
            newMaterial: false,
            presentationTitle: '',
            topicSimple: '',
            category: '',
            notes: '',
          })
        };

        if (i === 0 && existingSession?._id) {
          onSubmit(dataToSubmit, existingSession._id);
        } else {
          onSubmit(dataToSubmit);
        }
      }
    } else {
      const dataToSubmit = {
        sessionNumber: formData.sessionNumber,
        sessionTitle: formData.sessionTitle,
        casePresenter: formData.casePresenter,
        facilitator: formData.facilitator,
        supportingFacilitator: formData.supportingFacilitator,
        presentingSpecialist: formData.presentingSpecialist,
        supportingSpecialist1: formData.supportingSpecialist1,
        supportingSpecialist2: formData.supportingSpecialist2,
        supportingSpecialist3: formData.supportingSpecialist3,
        supportingSpecialist4: formData.supportingSpecialist4,
        participantGroup: formData.participantGroup,
        dateTime: new Date(formData.dateTime),
        presentationsDue: formData.presentationsDue ? new Date(formData.presentationsDue) : '',
        newMaterial: formData.newMaterial,
        color: formData.color,
        presentationTitle: formData.presentationTitle,
        topicSimple: formData.topicSimple,
        category: formData.category,
        notes: formData.notes,
        semester: formData.semester,
        series: formData.series,
      };

      onSubmit(dataToSubmit, existingSession?._id);
    }
    
    setFormData({});
    setPresentationTitleSearchQuery('');
    onClose();
  };

  const handleDelete = () => {
    onDelete(existingSession._id);
    setIsDeleteModalOpen(false);
    onClose();
  }

  const handleDeleteAllOccurrences = () => {
    if (!existingSession?.recurringGroupId) return;
    if (window.confirm(`Are you sure you want to delete all ${recurringGroupCount} sessions in this recurring group?`)) {
      Meteor.call('sessions.removeRecurringGroup', existingSession.recurringGroupId, (error) => {
        if (error) {
          alert('Error deleting recurring sessions: ' + (error.reason || error.message));
        } else {
          alert(`Successfully deleted all ${recurringGroupCount} sessions!`);
          setIsDeleteModalOpen(false);
          setShowDeleteOptions(false);
          onClose();
        }
      });
    }
  }

  if (!isOpen) return null;

  const defaultInputStyle = `w-full shadow border border-gray-400 focus:border-echo-teal focus:ring-echo-teal rounded text-gray-700 p-2`
  const checkBoxColor = `checked:enabled:focus:bg-echo-teal checked:bg-echo-teal checked:hover:bg-echo-teal focus:ring-echo-teal`

  const specialistTopics = formData.presentingSpecialist ? getSpecialistTopics(formData.presentingSpecialist) : [];
  const filteredTopics = getFilteredTopics();
  const showCreateNewTopic = presentationTitleSearchQuery && (filteredTopics.length === 0 || !filteredTopics.some(t => t.title.toLowerCase() === presentationTitleSearchQuery.toLowerCase()));
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10 text-2xl"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">
          {existingSession ? 'Edit Session' : 'Create Session'}
          {isPartOfRecurringGroup && (
            <span className="ml-2 text-sm font-normal text-blue-600">
              (Part of {recurringGroupCount} recurring sessions)
            </span>
          )}
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Session Number */}
            <div className="form-group md:col-span-1">
              <label className="block font-medium mb-1">Session Number</label>
              <input
                type="text"
                name="sessionNumber"
                value={formData.sessionNumber}
                onChange={handleChange}
                className={defaultInputStyle}
                placeholder="#"
              />
            </div>
            {/* Session Title */}
            <div className="form-group md:col-span-4">
              <label className="block font-medium mb-1">Session Title</label>
              <input
                type="text"
                name="sessionTitle"
                value={formData.sessionTitle}
                onChange={handleChange}
                required
                className={defaultInputStyle}
              />
            </div>
            {/* Color with Copy Button */}
            <div className="form-group md:col-span-1 flex flex-col items-center justify-end gap-2">
              <label className="font-medium text-sm">Color</label>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                  <input
                    type="color"
                    name="color"
                    value={formData.color || '#0ea6b2'}
                    onChange={handleChange}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <div
                    style={{ backgroundColor: formData.color || '#0ea6b2' }}
                    className="w-full h-full shadow rounded-lg border border-gray-400 cursor-pointer flex items-center justify-center"
                  >
                    <MdEdit size={20} className="text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyHexToClipboard}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  title="Copy HEX"
                >
                  Copy
                </button>
              </div>
            </div>
            {/* Case Presenter */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Case Presenter</label>
              <input
                type="text"
                name="casePresenter"
                value={formData.casePresenter}
                onChange={handleChange}
                required
                className={defaultInputStyle}
              />
            </div>
            {/* Lead Facilitator */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Lead Facilitator</label>
              <select
                name="facilitator"
                value={formData.facilitator}
                onChange={handleChange}
                required
                className={defaultInputStyle}
              >
                <option value="">Select Facilitator</option>
                {users
                  .filter((user) => user.role_id === adminRoleId)
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                ))}
              </select>
            </div>
            {/* Supporting Facilitator */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Supporting Facilitator</label>
              <select
                name="supportingFacilitator"
                value={formData.supportingFacilitator}
                onChange={handleChange}
                className={defaultInputStyle}
              >
                <option value="">Select Supporting Facilitator</option>
                {users
                  .filter((user) => user.role_id === adminRoleId)
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                ))}
              </select>
            </div>
            {/* Presenting Specialist */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Presenting Specialist</label>
              <select
                name="presentingSpecialist"
                value={formData.presentingSpecialist}
                onChange={handleChange}
                required
                className={defaultInputStyle}
                style={{
                  color: specialists.find(g => g._id === formData.presentingSpecialist)?.nameColor || '#000000'
                }}
              >
                <option value="" style={{color: '#000000'}}>Select Presenting Specialist</option>
                {specialists?.map(spec => (
                  <option key={spec._id} value={spec._id} style={{color: spec.nameColor || '#000000'}}>
                    {spec.firstName} {spec.lastName}
                  </option>
                ))}
              </select>
            </div>
            {/* Supporting Specialist 1 */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Supporting Specialist 1</label>
              <select
                name="supportingSpecialist1"
                value={formData.supportingSpecialist1}
                onChange={handleChange}
                className={defaultInputStyle}
                style={{
                  color: specialists.find(g => g._id === formData.supportingSpecialist1)?.nameColor || '#000000'
                }}
              >
                <option value="" style={{color: '#000000'}}>Select Supporting Specialist 1</option>
                {specialists?.map(spec => (
                  <option key={spec._id} value={spec._id} style={{color: spec.nameColor || '#000000'}}>
                    {spec.firstName} {spec.lastName}
                  </option>
                ))}
              </select>
            </div>
            {/* Supporting Specialist 2 */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Supporting Specialist 2</label>
              <select
                name="supportingSpecialist2"
                value={formData.supportingSpecialist2}
                onChange={handleChange}
                className={defaultInputStyle}
                style={{
                  color: specialists.find(g => g._id === formData.supportingSpecialist2)?.nameColor || '#000000'
                }}
              >
                <option value="" style={{color: '#000000'}}>Select Supporting Specialist 2</option>
                {specialists?.map(spec => (
                  <option key={spec._id} value={spec._id} style={{color: spec.nameColor || '#000000'}}>
                    {spec.firstName} {spec.lastName}
                  </option>
                ))}
              </select>
            </div>
            {/* Empty space */}
            <div className="form-group md:col-span-2"></div>
            {/* Supporting Specialist 3 */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Supporting Specialist 3</label>
              <select
                name="supportingSpecialist3"
                value={formData.supportingSpecialist3}
                onChange={handleChange}
                className={defaultInputStyle}
                style={{
                  color: specialists.find(g => g._id === formData.supportingSpecialist3)?.nameColor || '#000000'
                }}
              >
                <option value="" style={{color: '#000000'}}>Select Supporting Specialist 3</option>
                {specialists?.map(spec => (
                  <option key={spec._id} value={spec._id} style={{color: spec.nameColor || '#000000'}}>
                    {spec.firstName} {spec.lastName}
                  </option>
                ))}
              </select>
            </div>
            {/* Supporting Specialist 4 */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Supporting Specialist 4</label>
              <select
                name="supportingSpecialist4"
                value={formData.supportingSpecialist4}
                onChange={handleChange}
                className={defaultInputStyle}
                style={{
                  color: specialists.find(g => g._id === formData.supportingSpecialist4)?.nameColor || '#000000'
                }}
              >
                <option value="" style={{color: '#000000'}}>Select Supporting Specialist 4</option>
                {specialists?.map(spec => (
                  <option key={spec._id} value={spec._id} style={{color: spec.nameColor || '#000000'}}>
                    {spec.firstName} {spec.lastName}
                  </option>
                ))}
              </select>
            </div>
            {/* Date & Time */}
            <div className="form-group md:col-span-3">
              <label className="block font-medium mb-1">Date & Time</label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                required
                className={defaultInputStyle}
              />
            </div>
            {/* Presentations Due */}
            <div className="form-group md:col-span-3">
              <label className="block font-medium mb-1">Presentations Due</label>
              <input
                type="datetime-local"
                name="presentationsDue"
                value={formData.presentationsDue}
                onChange={handleChange}
                className={defaultInputStyle}
              />
            </div>
            {/* Participant Group */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Participant Group</label>
              <select
                name="participantGroup"
                value={formData.participantGroup}
                onChange={handleChange}
                required
                className={defaultInputStyle}
                style={{
                  color: participantGroups.find(g => g._id === formData.participantGroup)?.nameColor || '#000000'
                }}
              >
                <option value="" style={{color: '#000000'}}>Select Participant Group</option>
                {participantGroups?.map(group => (
                  <option key={group._id} value={group._id} style={{color: group.nameColor || '#000000'}}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Presentation Titles with Autocomplete */}
            <div className="form-group md:col-span-2 relative" ref={presentationTitleDropdownRef}>
              <label className="block font-medium mb-1">Presentation Titles</label>
              <input
                type="text"
                value={presentationTitleSearchQuery}
                onChange={handlePresentationTitleSearchChange}
                onFocus={() => setShowPresentationTitleDropdown(true)}
                placeholder="Search or type new title..."
                required
                className={defaultInputStyle}
              />
              
              {showPresentationTitleDropdown && (presentationTitleSearchQuery || specialistTopics.length > 0) && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {specialistTopics.length > 0 && !presentationTitleSearchQuery && (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                        {specialists.find(s => s._id === formData.presentingSpecialist)?.firstName}'s Topics
                      </div>
                      {specialistTopics.map(topic => (
                        <div
                          key={topic._id}
                          onClick={() => handlePresentationTitleSelect(topic._id, topic.title)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        >
                          {topic.title}
                        </div>
                      ))}
                    </>
                  )}
                  
                  {presentationTitleSearchQuery && filteredTopics.length > 0 && (
                    <>
                      {filteredTopics.some(t => t.specialists_ids?.includes(formData.presentingSpecialist)) && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-blue-50 sticky top-0">
                          Specialist's Matching Topics
                        </div>
                      )}
                      {filteredTopics.filter(t => t.specialists_ids?.includes(formData.presentingSpecialist)).map(topic => (
                        <div
                          key={topic._id}
                          onClick={() => handlePresentationTitleSelect(topic._id, topic.title)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        >
                          <strong>{topic.title}</strong>
                        </div>
                      ))}
                      
                      {filteredTopics.filter(t => !t.specialists_ids?.includes(formData.presentingSpecialist)).length > 0 && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                          Other Matching Topics
                        </div>
                      )}
                      {filteredTopics.filter(t => !t.specialists_ids?.includes(formData.presentingSpecialist)).map(topic => (
                        <div
                          key={topic._id}
                          onClick={() => handlePresentationTitleSelect(topic._id, topic.title)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        >
                          {topic.title}
                        </div>
                      ))}
                    </>
                  )}
                  
                  {presentationTitleSearchQuery && showCreateNewTopic && (
                    <div
                      onClick={handleCreateNewPresentationTitle}
                      className="px-3 py-2 hover:bg-green-50 cursor-pointer text-green-600 font-medium border-t-2 border-green-200 sticky bottom-0 bg-white"
                    >
                      + Create new: "{presentationTitleSearchQuery}"
                    </div>
                  )}
                  
                  {presentationTitleSearchQuery && filteredTopics.length === 0 && !showCreateNewTopic && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No matching topics found
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Topic - Simple Dropdown */}
            <div className="form-group md:col-span-1">
              <label className="block font-medium mb-1">Topic</label>
              <select
                name="topicSimple"
                value={formData.topicSimple}
                onChange={handleChange}
                className={defaultInputStyle}
              >
                <option value="">Select Topic</option>
                {simpleTopics?.map(topic => (
                  <option key={topic._id} value={topic._id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
            {/* Category */}
            <div className="form-group md:col-span-1">
              <label className="block font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={defaultInputStyle}
              >
                <option value="">Select Category</option>
                {categories?.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.title}{category.focus ? ` (${category.focus})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {/* New Material */}
            <div className="form-group md:col-span-2 flex items-center justify-center gap-5 mt-4">
              <label className="font-medium">New Material</label>
              <input
                type="checkbox"
                name="newMaterial"
                checked={formData.newMaterial}
                onChange={handleChange}
                className={`w-5 h-5 cursor-pointer ${checkBoxColor}`}
              />
            </div>
            {/* Semester */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                className={defaultInputStyle}
              >
                <option value="">Select Semester</option>
                {semesters?.map(sem => (
                  <option key={sem._id} value={sem._id}>
                    {sem.title}
                  </option>
                ))}
              </select>
            </div>
            {/* Series */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium mb-1">Series</label>
              <select
                name="series"
                value={formData.series}
                onChange={handleChange}
                required
                className={defaultInputStyle}
              >
                <option value="">Select Series</option>
                {series?.map(ser => (
                  <option key={ser._id} value={ser._id}>
                    {ser.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurring Session Options - only when creating */}
          {!existingSession && (
            <div className="mt-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className={`w-5 h-5 cursor-pointer ${checkBoxColor}`}
                />
                <label className="font-medium text-lg cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}>
                  Recurring Session
                </label>
              </div>
              
              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block font-medium text-sm mb-1">Number of Occurrences</label>
                    <input
                      type="number"
                      name="recurrenceCount"
                      value={formData.recurrenceCount}
                      onChange={handleChange}
                      min="2"
                      max="52"
                      className={defaultInputStyle}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-sm mb-1">Repeat Every</label>
                    <select
                      name="recurrenceInterval"
                      value={formData.recurrenceInterval}
                      onChange={handleChange}
                      className={defaultInputStyle}
                    >
                      <option value="daily">Day</option>
                      <option value="weekly">Week</option>
                      <option value="biweekly">2 Weeks</option>
                      <option value="monthly">Month</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 mt-5">
                    <input
                      type="checkbox"
                      name="blankFieldsOnRecurrence"
                      checked={formData.blankFieldsOnRecurrence}
                      onChange={handleChange}
                      className={`w-5 h-5 cursor-pointer ${checkBoxColor}`}
                    />
                    <label className="font-medium text-sm cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, blankFieldsOnRecurrence: !prev.blankFieldsOnRecurrence }))}>
                      Blank Fields on Recurrence
                    </label>
                  </div>
                </div>
              )}
              
              {formData.isRecurring && formData.blankFieldsOnRecurrence && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <strong>Note:</strong> Only Participant Group, Color, Semester, and Series will be copied to future sessions. All other fields will be blank.
                </div>
              )}
            </div>
          )}

          {/* Reschedule Future Occurrences - only when editing a recurring session */}
          {existingSession && isPartOfRecurringGroup && (
            <div className="mt-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg text-orange-800">Reschedule Future Occurrences</h3>
                <button
                  type="button"
                  onClick={() => setShowRescheduleOptions(!showRescheduleOptions)}
                  className="text-orange-600 hover:text-orange-800 text-sm underline"
                >
                  {showRescheduleOptions ? 'Hide' : 'Show'}
                </button>
              </div>

              {showRescheduleOptions && (
                <div className="mt-4">
                  <p className="text-sm text-orange-700 mb-3">
                    Change the repeat interval for all <strong>future</strong> sessions in this group. Past sessions will not be affected.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block font-medium text-sm mb-1">New Repeat Interval</label>
                      <select
                        value={newRescheduleInterval}
                        onChange={(e) => setNewRescheduleInterval(e.target.value)}
                        className={defaultInputStyle}
                      >
                        <option value="daily">Every Day</option>
                        <option value="weekly">Every Week</option>
                        <option value="biweekly">Every 2 Weeks</option>
                        <option value="monthly">Every Month</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleRescheduleFutureOccurrences}
                      className="mt-5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Apply New Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes/Objectives */}
          <div className="form-group mt-4">
            <label className="block font-medium mb-1">Notes/Objectives</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className={defaultInputStyle}
            ></textarea>
          </div>
          
          <div className="flex justify-between gap-4 mt-6">
            <div className="flex gap-2">
              {existingSession && !isPartOfRecurringGroup && (
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Session
                </button>
              )}
              
              {existingSession && isPartOfRecurringGroup && (
                <>
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete This Session
                  </button>
                  <button
                    type="button"
                    className="bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded"
                    onClick={handleDeleteAllOccurrences}
                  >
                    Delete All {recurringGroupCount} Occurrences
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={onClose}
              >
                Cancel
              </button>
              
              {existingSession && isPartOfRecurringGroup && !showEditRecurringOptions && (
                <button
                  type="button"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setShowEditRecurringOptions(true)}
                >
                  Edit Options
                </button>
              )}

              {existingSession && isPartOfRecurringGroup && showEditRecurringOptions && (
                <>
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      handleSubmit(false);
                      setShowEditRecurringOptions(false);
                    }}
                  >
                    Save This Session Only
                  </button>
                  <button
                    type="button"
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleSubmit(true)}
                  >
                    Save All {recurringGroupCount} Occurrences
                  </button>
                </>
              )}

              {(!existingSession || (existingSession && !isPartOfRecurringGroup) || (existingSession && isPartOfRecurringGroup && !showEditRecurringOptions)) && (
                <button
                  type="button"
                  className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                  onClick={() => handleSubmit(false)}
                >
                  {existingSession ? 'Save Changes' : (formData.isRecurring ? `Create ${formData.recurrenceCount} Sessions` : 'Create')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        onDelete={handleDelete}
        itemType="Session"
      />
    </div>
  );
};

export default SessionModal;