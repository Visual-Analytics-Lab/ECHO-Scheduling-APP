import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { GreenButton, GrayButton, Button } from '../shadecn-components/button';

const PopupForm = ({ 
  isOpen, 
  onClose, 
  collection, 
  fields, 
  title = 'Add New Item',
  onSuccess = () => {} 
}) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    Meteor.call(`${collection}.insert`, formData, (error, result) => {
      if (error) {
        setError(error.reason || 'An error occurred');
      } else {
        setFormData({});
        onSuccess(result);
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, type = 'text' }) => (
            <div key={name} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          ))}
          
          <div className="flex justify-end gap-2">
            <GrayButton onClick={onClose} >
              Cancel
            </GrayButton>
            <GreenButton type="submit" >
              Save
            </GreenButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;