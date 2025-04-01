import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { GreenButton, GrayButton, Button } from '../shadecn-components/button';

import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
        

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
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    // Convert the local time to UTC


    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handlePReactChange = (e, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: e.value // PrimeReact MultiSelect provides `e.value` as the selected array
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    // Show errors for empty fields that are required.
    fields.forEach(({ name, inputType, required }) => {
      if (required && (!formData[name] || (Array.isArray(formData[name]) && formData[name].length === 0))) {
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
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Use grid layout with dynamic column span */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ name, label, inputType, colSpan }) => {
              const hasError = errors[name];
              // Dynamically set the column span
              const columnClass = colSpan ? `md:col-span-${colSpan}` : 'md:col-span-2';

              let inputElement;
              switch (inputType) {
                case "multiSelect":
                  inputElement = (
                    <MultiSelect
                      value={formData[name] || []}
                      onChange={(e) => handlePReactChange(e, name)}
                      options={fieldData[name].map((s) => ({ ...s, key: s._id }))}
                      optionLabel={fieldData[name][0]?.title ? "title" : "name"}
                      optionValue="_id"
                      placeholder={`Select ${label}`}
                      maxSelectedLabels={3}
                      className={`w-full shadow border rounded text-gray-700 leading-tight ${hasError ? 'border-red-500' : ''}`}
                      panelClassName="bg-gray-100"
                    />
                  );
                  break;
                case "select":
                  inputElement = (
                    <Dropdown
                      value={formData[name] || ""}
                      onChange={(e) => handlePReactChange(e, name)}
                      options={fieldData[name].map((s) => ({ ...s, key: s._id }))}
                      optionLabel={fieldData[name][0]?.title ? "title" : "name"}
                      optionValue="_id"
                      placeholder={`Select ${label}`}
                      className={`w-full shadow border rounded text-gray-700 leading-tight ${hasError ? 'border-red-500' : ''}`}
                      panelClassName="bg-gray-100"
                    />
                  );
                  break;
                case "number":
                  inputElement = (
                    <input
                      type="number"
                      name={name}
                      value={formData[name] || ''}
                      onChange={handleChange}
                      className={`w-full shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-gray-300 ${hasError ? 'border-red-500' : ''}`}
                      placeholder="Enter a number"
                    />
                  );
                  break;
                case "color":
                  inputElement = (
                    <input
                      type="color"
                      name={name}
                      value={formData[name] || ''}
                      onChange={handleChange}
                      className={`w-9 h-9 shadow border rounded text-gray-700 leading-tight focus:outline-gray-300 ${hasError ? 'border-red-500' : ''}`}
                    />
                  );
                  break;
                case "dateTime":
                  inputElement = (
                    <input
                      type="dateTime-local"
                      name={name}
                      // TODO: Make sure these dates are properly stored with UTC and displayed with local time
                      value={formData[name] || ''}
                      onChange={handleDateChange}
                      className={`w-full shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-gray-300 ${hasError ? 'border-red-500' : ''}`}
                    />
                  );
                  break;
                default:
                  inputElement = (
                    <input
                      type="text"
                      name={name}
                      value={formData[name] || ''}
                      onChange={handleChange}
                      className={`w-full shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-gray-300 ${hasError ? 'border-red-500' : ''}`}
                    />
                  );
                  break;
              }

              let displayClass = '';
              if (['color'].includes(inputType)) displayClass = "flex items-center gap-5 mt-4"
              // Column class controls the column span of the field input
              // Display class controls if the field input and label should flex so they're on the same line
              return (
              <div key={name} className={`${columnClass}`}>
                <div className={`${displayClass}`}>
                  <label className="text-gray-700 text-sm font-bold">{label}</label>
                  {inputElement}
                </div>
                {hasError && <p className="text-red-500 text-xs italic">{hasError}</p>}
              </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <GrayButton onClick={handleClose}>Cancel</GrayButton>
            <GreenButton type="submit">Save</GreenButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;