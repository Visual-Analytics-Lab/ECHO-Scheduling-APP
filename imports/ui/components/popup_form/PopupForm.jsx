import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { GreenButton, GrayButton, Button } from '../shadecn-components/button';

import { MultiSelect } from 'primereact/multiselect';
        

const PopupForm = ({ 
  isOpen, 
  setIsOpen, 
  collection, 
  formData,
  setFormData,
  fields, 
  fieldData,
  title,
  alertSuccess,

}) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleMultiSelectChange = (e, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: e.value // PrimeReact MultiSelect provides `e.value` as the selected array
    }));
  };

  const validateForm = () => {
    const newErrors = {};
  
    fields.forEach(({ name, inputType }) => {
      if (!formData[name] || (Array.isArray(formData[name]) && formData[name].length === 0)) {
        newErrors[name] = "This field is required";
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns `true` if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Prevent submission if validation fails
  
    // Set method to update if _id already exists, otherwise insert
    const method = formData._id ? `${collection}.update` : `${collection}.insert`;
    // Pass in _id and data if updating, or just data if inserting
    const args = formData._id ? [formData._id, formData] : [formData];
  
    Meteor.call(method, ...args, (error, result) => {
      if (error) {
        console.error("PopupForm submission error:", error);
      } else {
        alertSuccess(formData._id ? 'updated' : 'added');
        handleClose();
      }
    });
  };
  const handleClose = (e) => {
    if (e) e.preventDefault()
    setFormData({});
    setErrors({});
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )} */}

        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, inputType }) => {
            const hasError = errors[name]; // Check if this field has an error
            
            // Set input element based on inputType
            let inputElement;
            if (inputType === "multiSelect") {
              // TODO: Add css to the dropdown checkboxes so they don't blend into the background
              inputElement = (
                <MultiSelect 
                  value={formData[name] || []} 
                  onChange={(e) => handleMultiSelectChange(e, name)} 
                  options={fieldData[name].map((s) => ({ ...s, key: s._id }))} 
                  optionLabel={fieldData[name][0]?.title ? "title" : "name"}  
                  optionValue="_id"
                  placeholder={`Select ${label}`}
                  maxSelectedLabels={3} 
                  className={`shadow border rounded w-full text-gray-700 leading-tight ${hasError ? 'border-red-500' : ''}`} 
                  panelClassName="bg-gray-100"
                />                
              )
            } else {
              inputElement = (
                <input
                  type="text"
                  name={name}
                  value={formData[name] || ''}
                  onChange={handleChange}
                  className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-gray-300 ${hasError ? 'border-red-500' : ''}`}
                />                
              )
            }

            return (
              <div key={name} className="mb-4">
                {/* Label and error */}
                <div className="flex justify-between items-center">
                  <label className="block text-gray-700 text-sm font-bold">
                    {label}
                  </label>
                  {hasError && <p className="text-red-500 text-xs italic">{hasError}</p>}
                </div>
                {/* Render inputElement */}
                {inputElement}
              </div>
            );
          })}
          
          <div className="flex justify-end gap-2">
            <GrayButton onClick={handleClose}>Cancel</GrayButton>
            <GreenButton type="submit">Save</GreenButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;