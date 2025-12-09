import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import {
  UsersCollection,
  SpecialistsCollection,
  ParticipantGroupsCollection,
  TopicsCollection,
  RolesCollection,
  SemesterCollection,
  SeriesCollection,
  CategoriesCollection
} from '../../../api/collections';
import { Meteor } from 'meteor/meteor';
import { MdEdit } from 'react-icons/md';
import DeleteModal from '../delete_modal/DeleteModal'


const SessionModal = ({ isOpen, onClose, onSubmit, onDelete, selectedDate, existingSession = null}) => {
  // Subscribe to collections
  useEffect(() => {
    const subscriptions = [
      Meteor.subscribe("users"),
      Meteor.subscribe("roles"),
      Meteor.subscribe("specialists"),
      Meteor.subscribe("participantGroups"),
      Meteor.subscribe("semesters"),
      Meteor.subscribe("series"),
      Meteor.subscribe("topics"),
      Meteor.subscribe("categories"),
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
  const roles = useTracker(() => RolesCollection.find().fetch());
  const categories = useTracker(() => CategoriesCollection.find().fetch());

  const [formData, setFormData] = useState({
    sessionTitle: '',
    casePresenter: '',
    facilitator: '',
    supportingFacilitator: '',
    presentingSpecialist: '',
    supportingSpecialist1: '',
    supportingSpecialist2: '',
    participantGroup: '',
    dateTime: '',
    presentationsDue: '',
    newMaterial: false,
    color: '',
    topic: '',
    notes: '',
    semester: '',
    series: '',
    isRecurring: false,
    recurrenceCount: 2,
    recurrenceInterval: 'weekly',
    blankFieldsOnRecurrence: false
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const topicDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target)) {
        setShowTopicDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (existingSession) {
      setFormData({
        sessionTitle: existingSession.sessionTitle || '',
        casePresenter: existingSession.casePresenter || '',
        facilitator: existingSession.facilitator || '',
        supportingFacilitator: existingSession.supportingFacilitator || '',
        presentingSpecialist: existingSession.presentingSpecialist || '',
        supportingSpecialist1: existingSession.supportingSpecialist1 || '',
        supportingSpecialist2: existingSession.supportingSpecialist2 || '',
        participantGroup: existingSession.participantGroup || '',
        dateTime: formatLocalDateTime(existingSession.dateTime),
        presentationsDue: formatLocalDateTime(existingSession.presentationsDue),
        newMaterial: existingSession.newMaterial || false,
        color: existingSession.color || '',
        topic: existingSession.topic || '',
        notes: existingSession.notes || '',
        semester: existingSession.semester || '',
        series: existingSession.series || '',
        isRecurring: false,
        recurrenceCount: 2,
        recurrenceInterval: 'weekly',
        blankFieldsOnRecurrence: false
      });
      // Set search query to selected topic title
      const selectedTopic = topics.find(t => t._id === existingSession.topic);
      if (selectedTopic) {
        setTopicSearchQuery(selectedTopic.title);
      }
    } else {
      setFormData({
        sessionTitle: '',
        casePresenter: '',
        facilitator: '',
        supportingFacilitator: '',
        presentingSpecialist: '',
        supportingSpecialist1: '',
        supportingSpecialist2: '',
        participantGroup: '',
        dateTime: formatLocalDateTime(selectedDate),
        presentationsDue: formatLocalDateTime(getWeekBefore(selectedDate)),
        newMaterial: false,
        color: '',
        topic: '',
        notes: '',
        semester: '',
        series: '',
        isRecurring: false,
        recurrenceCount: 2,
        recurrenceInterval: 'weekly',
        blankFieldsOnRecurrence: false
      });
      setTopicSearchQuery('');
    }
  }, [existingSession, selectedDate]);

  // Get specialist's topics when specialist is selected
  const getSpecialistTopics = (specialistId) => {
    if (!specialistId) return [];
    return topics.filter(topic => 
      topic.specialists_ids && topic.specialists_ids.includes(specialistId)
    );
  };

  // Get filtered topics for autocomplete
  const getFilteredTopics = () => {
    if (!topicSearchQuery) return [];
    
    const query = topicSearchQuery.toLowerCase();
    let filtered = topics.filter(topic => 
      topic.title.toLowerCase().includes(query)
    );

    // If a presenting specialist is selected, prioritize their topics
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

  // UTC Date to Local Time
  const formatLocalDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getWeekBefore = (dateString) => {
    const date = new Date(dateString);
    const weekBefore = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
    return weekBefore;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle topic search input
  const handleTopicSearchChange = (e) => {
    const value = e.target.value;
    setTopicSearchQuery(value);
    setShowTopicDropdown(true);
    setFormData(prev => ({ ...prev, topic: '' }));
  };

  // Handle topic selection from dropdown
  const handleTopicSelect = (topicId, topicTitle) => {
    setFormData(prev => ({ ...prev, topic: topicId }));
    setTopicSearchQuery(topicTitle);
    setShowTopicDropdown(false);
  };

  // Handle creating a new topic
  const handleCreateNewTopic = () => {
    if (!topicSearchQuery.trim()) return;

    Meteor.call('topics.insert', { 
      title: topicSearchQuery.trim(),
      specialists_ids: formData.presentingSpecialist ? [formData.presentingSpecialist] : []
    }, (error, result) => {
      if (error) {
        console.error('Error creating topic:', error);
        alert('Error creating topic: ' + (error.reason || error.message));
      } else {
        setFormData(prev => ({ ...prev, topic: result }));
        setShowTopicDropdown(false);
      }
    });
  };

  // On submit, convert dates and handle recurring sessions
  const handleSubmit = () => {
    if (formData.isRecurring && formData.recurrenceCount > 1) {
      // Create multiple sessions
      const baseDate = new Date(formData.dateTime);
      const basePresentationsDue = formData.presentationsDue ? new Date(formData.presentationsDue) : null;

      for (let i = 0; i < formData.recurrenceCount; i++) {
        const sessionDate = new Date(baseDate);
        let presentationsDueDate = basePresentationsDue ? new Date(basePresentationsDue) : null;

        // Calculate date based on recurrence interval
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
          // Include other fields only for first occurrence or if not blanking fields
          ...(i === 0 || !formData.blankFieldsOnRecurrence ? {
            sessionTitle: formData.sessionTitle,
            casePresenter: formData.casePresenter,
            facilitator: formData.facilitator,
            supportingFacilitator: formData.supportingFacilitator,
            presentingSpecialist: formData.presentingSpecialist,
            supportingSpecialist1: formData.supportingSpecialist1,
            supportingSpecialist2: formData.supportingSpecialist2,
            newMaterial: formData.newMaterial,
            topic: formData.topic,
            notes: formData.notes,
            semester: formData.semester,
            series: formData.series,
          } : {
            sessionTitle: '',
            casePresenter: '',
            facilitator: '',
            supportingFacilitator: '',
            presentingSpecialist: '',
            supportingSpecialist1: '',
            supportingSpecialist2: '',
            newMaterial: false,
            topic: '',
            notes: '',
            semester: '',
            series: '',
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
        sessionTitle: formData.sessionTitle,
        casePresenter: formData.casePresenter,
        facilitator: formData.facilitator,
        supportingFacilitator: formData.supportingFacilitator,
        presentingSpecialist: formData.presentingSpecialist,
        supportingSpecialist1: formData.supportingSpecialist1,
        supportingSpecialist2: formData.supportingSpecialist2,
        participantGroup: formData.participantGroup,
        dateTime: new Date(formData.dateTime),
        presentationsDue: formData.presentationsDue ? new Date(formData.presentationsDue) : '',
        newMaterial: formData.newMaterial,
        color: formData.color,
        topic: formData.topic,
        notes: formData.notes,
        semester: formData.semester,
        series: formData.series,
      };

      onSubmit(dataToSubmit, existingSession?._id);
    }
    
    setFormData({});
    setTopicSearchQuery('');
    onClose();
  };

  const handleDelete = () => {
    onDelete(existingSession._id);
    onClose();
  }

  if (!isOpen) return null;

  const defaultInputStyle = `w-full shadow border border-gray-400 focus:border-echo-teal focus:ring-echo-teal rounded text-gray-700 p-2`
  const checkBoxColor = `checked:enabled:focus:bg-echo-teal checked:bg-echo-teal checked:hover:bg-echo-teal focus:ring-echo-teal`

  const specialistTopics = formData.presentingSpecialist ? getSpecialistTopics(formData.presentingSpecialist) : [];
  const filteredTopics = getFilteredTopics();
  const showCreateNewTopic = topicSearchQuery && (filteredTopics.length === 0 || !filteredTopics.some(t => t.title.toLowerCase() === topicSearchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10 text-2xl"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">
          {existingSession ? 'Edit Session' : 'Create Session'}
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Session Title */}
            <div className="form-group md:col-span-5">
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
            {/* Color */}
            <div className="form-group md:col-span-1 flex items-center justify-center gap-3 mt-6">
              <label className="font-medium">Color</label>
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
            {/* Facilitator */}
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
            {/* supportingFacilitator */}
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
                  color:
                    specialists.find(g => g._id === formData.presentingSpecialist)?.nameColor || '#000000'
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
                  color:
                    specialists.find(g => g._id === formData.supportingSpecialist1)?.nameColor || '#000000'
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
                  color:
                    specialists.find(g => g._id === formData.supportingSpecialist2)?.nameColor || '#000000'
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
                  color:
                    participantGroups.find(g => g._id === formData.participantGroup)?.nameColor || '#000000'
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
            {/* Topic with Autocomplete */}
            <div className="form-group md:col-span-2 relative" ref={topicDropdownRef}>
              <label className="block font-medium mb-1">Presentation Title</label>
              <input
                type="text"
                value={topicSearchQuery}
                onChange={handleTopicSearchChange}
                onFocus={() => setShowTopicDropdown(true)}
                placeholder="Search or type new title..."
                required
                className={defaultInputStyle}
              />
              
              {/* Autocomplete Dropdown */}
              {showTopicDropdown && (topicSearchQuery || specialistTopics.length > 0) && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {/* Specialist's existing topics */}
                  {specialistTopics.length > 0 && !topicSearchQuery && (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                        {specialists.find(s => s._id === formData.presentingSpecialist)?.firstName}'s Topics
                      </div>
                      {specialistTopics.map(topic => (
                        <div
                          key={topic._id}
                          onClick={() => handleTopicSelect(topic._id, topic.title)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        >
                          {topic.title}
                        </div>
                      ))}
                    </>
                  )}
                  
                  {/* Filtered topics based on search */}
                  {topicSearchQuery && filteredTopics.length > 0 && (
                    <>
                      {filteredTopics.some(t => t.specialists_ids?.includes(formData.presentingSpecialist)) && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-blue-50 sticky top-0">
                          Specialist's Matching Topics
                        </div>
                      )}
                      {filteredTopics.filter(t => t.specialists_ids?.includes(formData.presentingSpecialist)).map(topic => (
                        <div
                          key={topic._id}
                          onClick={() => handleTopicSelect(topic._id, topic.title)}
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
                          onClick={() => handleTopicSelect(topic._id, topic.title)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        >
                          {topic.title}
                        </div>
                      ))}
                    </>
                  )}
                  
                  {/* Create new topic option */}
                  {topicSearchQuery && showCreateNewTopic && (
                    <div
                      onClick={handleCreateNewTopic}
                      className="px-3 py-2 hover:bg-green-50 cursor-pointer text-green-600 font-medium border-t-2 border-green-200 sticky bottom-0 bg-white"
                    >
                      + Create new: "{topicSearchQuery}"
                    </div>
                  )}
                  
                  {topicSearchQuery && filteredTopics.length === 0 && !showCreateNewTopic && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No matching topics found
                    </div>
                  )}
                </div>
              )}
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

          {/* Recurring Session Options */}
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
                  <strong>Note:</strong> Only Participant Group and Color will be copied to future sessions. All other fields will be blank.
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="form-group mt-4">
            <label className="block font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className={defaultInputStyle}
            ></textarea>
          </div>
          
          <div className="flex justify-between gap-4 mt-6">
            <div>
              {existingSession && (
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Session
                </button>
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
              <button
                type="button"
                className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                onClick={handleSubmit}
              >
                {existingSession ? 'Save Changes' : (formData.isRecurring ? `Create ${formData.recurrenceCount} Sessions` : 'Create')}
              </button>
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