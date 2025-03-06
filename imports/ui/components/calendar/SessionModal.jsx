import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import {
  UsersCollection,
  SpecialistsCollection,
  ParticipantGroupsCollection,
  TopicsCollection,
  SemesterCollection,
  SeriesCollection
} from '../../../api/collections';
import { Meteor } from 'meteor/meteor';

const SessionModal = ({ isOpen, onClose, onSubmit, onDelete, selectedDate, existingSession = null}) => {
  // Subscribe to collections
  const users = useTracker(() => Meteor.users.find().fetch());
  const specialists = useTracker(() => {
    Meteor.subscribe('specialists');
    return SpecialistsCollection.find().fetch();
  });
  const participantGroups = useTracker(() => {
    Meteor.subscribe('participantGroups');
    return ParticipantGroupsCollection.find().fetch();
  });
  const topics = useTracker(() => {
    Meteor.subscribe('topics');
    return TopicsCollection.find().fetch();
  });
  const semesters = useTracker(() => {
    Meteor.subscribe('semesters');
    return SemesterCollection.find().fetch();
  });
  const series = useTracker(() => {
    Meteor.subscribe('series');
    return SeriesCollection.find().fetch();
  });

  const [formData, setFormData] = useState({
    sessionTitle: '',
    casePresenter: '',
    facilitator: '',
    coordinator: '',
    presentingSpecialist: '',
    supportingSpecialist1: '',
    supportingSpecialist2: '',
    participantGroup: '',
    dateTime: selectedDate,
    presentationsDue: '',
    newMaterial: false,
    color: '',
    topic: '',
    notes: '',
    semester: '',
    series: ''
  });

  useEffect(() => {
    if (existingSession) {
      setFormData({
        sessionTitle: existingSession.sessionTitle,
        casePresenter: existingSession.casePresenter,
        facilitator: existingSession.facilitator,
        coordinator: existingSession.coordinator,
        presentingSpecialist: existingSession.presentingSpecialist,
        supportingSpecialist1: existingSession.supportingSpecialist1,
        supportingSpecialist2: existingSession.supportingSpecialist2,
        participantGroup: existingSession.participantGroup,
        dateTime: new Date(existingSession.dateTime).toISOString().slice(0, 16),
        presentationsDue: existingSession.presentationsDue
          ? new Date(existingSession.presentationsDue).toISOString().slice(0, 10)
          : '',
        newMaterial: existingSession.newMaterial,
        color: existingSession.color,
        topic: existingSession.topic,
        notes: existingSession.notes,
        semester: existingSession.semester,
        series: existingSession.series
      });
    } else {
      setFormData({
        sessionTitle: '',
        casePresenter: '',
        facilitator: '',
        coordinator: '',
        presentingSpecialist: '',
        supportingSpecialist1: '',
        supportingSpecialist2: '',
        participantGroup: '',
        dateTime: selectedDate,
        presentationsDue: '',
        newMaterial: false,
        color: '',
        topic: '',
        notes: '',
        semester: '',
        series: ''
      });
    }
  }, [existingSession, selectedDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = () => {
    onSubmit(formData, existingSession?._id);
    setFormData({});
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      onDelete(existingSession._id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">
          {existingSession ? 'Edit Session' : 'Create Session'}
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Session Title */}
            <div className="form-group">
              <label className="block font-medium">Session Title</label>
              <input
                type="text"
                name="sessionTitle"
                value={formData.sessionTitle}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
              />
            </div>
            {/* Case Presenter */}
            <div className="form-group">
              <label className="block font-medium">Case Presenter</label>
              <input
                type="text"
                name="casePresenter"
                value={formData.casePresenter}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
              />
            </div>
            {/* Facilitator */}
            <div className="form-group">
              <label className="block font-medium">Facilitator</label>
              <select
                name="facilitator"
                value={formData.facilitator}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
              >
                <option value="">Select Facilitator</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            {/* Coordinator */}
            <div className="form-group">
              <label className="block font-medium">Coordinator</label>
              <select
                name="coordinator"
                value={formData.coordinator}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
              >
                <option value="">Select Coordinator</option>
                {users?.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            {/* Presenting Specialist */}
            <div className="form-group">
              <label className="block font-medium">Presenting Specialist</label>
              <select
                name="presentingSpecialist"
                value={formData.presentingSpecialist}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
              >
                <option value="">Select Presenting Specialist</option>
                {specialists?.map(spec => (
                  <option key={spec._id} value={spec._id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Supporting Specialist 1 */}
            <div className="form-group">
              <label className="block font-medium">Supporting Specialist 1</label>
              <select
                name="supportingSpecialist1"
                value={formData.supportingSpecialist1}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full p-2"
              >
                <option value="">Select Supporting Specialist 1</option>
                {specialists?.map(spec => (
                  <option key={spec._id} value={spec._id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Supporting Specialist 2 */}
            <div className="form-group">
              <label className="block font-medium">Supporting Specialist 2</label>
              <select
                name="supportingSpecialist2"
                value={formData.supportingSpecialist2}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full p-2"
              >
                <option value="">Select Supporting Specialist 2</option>
                {specialists?.map(spec => (
                  <option key={spec._id} value={spec._id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Participant Group */}
            <div className="form-group">
              <label className="block font-medium">Participant Group</label>
              <select
                name="participantGroup"
                value={formData.participantGroup}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
              >
                <option value="">Select Participant Group</option>
                {participantGroups?.map(group => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Date & Time */}
            <div className="form-group">
              <label className="block font-medium">Date & Time</label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
              />
            </div>
            {/* Presentations Due */}
            <div className="form-group">
              <label className="block font-medium">Presentations Due</label>
              <input
                type="date"
                name="presentationsDue"
                value={formData.presentationsDue}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full p-2"
              />
            </div>
            {/* New Material */}
            <div className="form-group">
              <label className="block font-medium">New Material</label>
              <input
                type="checkbox"
                name="newMaterial"
                checked={formData.newMaterial}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full p-2"
              />
            </div>
            {/* Color */}
            <div className="form-group">
              <label className="block font-medium">Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full p-2"
              />
            </div>
            {/* Topic */}
            <div className="form-group">
              <label className="block font-medium">Topic</label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
              >
                <option value="">Select Topic</option>
                {topics?.map(topic => (
                  <option key={topic._id} value={topic._id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
            {/* Semester */}
            <div className="form-group">
              <label className="block font-medium">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
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
            <div className="form-group">
              <label className="block font-medium">Series</label>
              <select
                name="series"
                value={formData.series}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded w-full p-2"
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
          <div className="form-group mt-4">
            <label className="block font-medium">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="border border-gray-300 rounded w-full p-2"
            ></textarea>
          </div>
          <div className="flex justify-between gap-4 mt-6">
            <div>
              {/* Delete button only shows when editing */}
              {existingSession && (
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleDelete}
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleSubmit}
              >
                {existingSession ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
