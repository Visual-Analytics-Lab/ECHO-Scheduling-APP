import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { GreenButton, GrayButton, Button } from '../shadecn-components/button';

import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { MdEdit } from 'react-icons/md';


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
  isReadOnly,
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
    const localDateTime = e.target.value; // Example: "2025-04-02T14:30"
    const utcDate = new Date(localDateTime); // Converts it to UTC
    
    setFormData({
      ...formData,
      [e.target.name]: utcDate, // Store as ISO string
    });
  };
  const handlePReactChange = (e, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: e.value // PrimeReact MultiSelect provides `e.value` as the selected array
    }));
  };

  // Helper function to format date in local time for <input type="datetime-local">
  const formatLocalDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    // Extracts local YYYY-MM-DD and HH:MM
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  const formatDisplayDateTime  = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString();
  };

  const getOptionLabels = (field) => {
    if (field.name) return
  }

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

    if(isReadOnly) return;
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
    if (e) e.preventDefault();
    setFormData({});
    setErrors({});
    setIsOpen(false);
  }
  const getDisplayValue = (fieldName, value) => {
    if(!value) return 'N/A';

    const options = fieldData[fieldName] || [];
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      
      return value.map(val => {
        const option = options.find(opt => opt._id === val);
        if (!option) return val;
        return option.firstName && option.lastName 
          ? `${option.firstName} ${option.lastName}` 
          : option.title || option.name;
      }).join(', ');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isReadOnly? `View ${title}`: title}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Use grid layout with dynamic column span */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            {fields.map(({ name, label, inputType, colSpan, required }) => {
              
              const hasError = errors[name];
              // Dynamically set the column span
              const columnClass = colSpan ? `md:col-span-${colSpan}` : 'md:col-span-2';
              const defaultInputStyle = `w-full shadow border border-gray-400 focus:border-echo-teal focus:ring-echo-teal rounded text-gray-700 leading-tight`

              // Preprocess options to show correct label given name, title, firstName + lastName
              const processedOptions = fieldData[name]?.map((s) => ({
                ...s,
                key: s._id,
                processedName: s.firstName && s.lastName ? `${s.firstName} ${s.lastName}` : s.title || s.name
              })) || [];

              let inputElement;
              if(isReadOnly) {
                switch (inputType) {
                  case "multiSelect":
                  case "select":
                    inputElement = (
                      <div className="text-gray-800 p-2 border border-gray-200 rounded bg-gray-50">
                        {getDisplayValue(name, formData[name])}
                      </div>
                    );
                    break;
                  case "color":
                    inputElement = (
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-lg border border-gray-300" 
                          style={{ backgroundColor: formData[name] || '#FFFFFF' }}
                        />
                        <span className="text-gray-800 ml-2">{formData[name] || 'N/A'}</span>
                      </div>
                    );
                    break;
                  case "dateTime":
                    inputElement = (
                      <div className="text-gray-800 p-2 border border-gray-200 rounded bg-gray-50">
                        {formatDisplayDateTime(formData[name])}
                      </div>
                    );
                    break;
                  case "textArea":
                    inputElement = (
                      <div className="text-gray-800 p-2 border border-gray-200 rounded bg-gray-50 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {formData[name] || 'N/A'}
                      </div>
                    );
                    break;
                  case "number":
                    inputElement = (
                      <div className="text-gray-800 p-2 border border-gray-200 rounded bg-gray-50">
                        {formData[name] || 'N/A'}
                      </div>
                    );
                    break;
                  default:
                    inputElement = (
                      <div className="text-gray-800 p-2 border border-gray-200 rounded bg-gray-50">
                        {formData[name] || 'N/A'}
                      </div>
                    );
                    break;
                }
              } else {
              switch (inputType) {
                case "multiSelect":
                  inputElement = (
                    <MultiSelect
                      value={formData[name] || []}
                      onChange={(e) => handlePReactChange(e, name)}
                      options={processedOptions}
                      optionLabel="processedName"
                      optionValue="_id"
                      placeholder={`Select ${label}`}
                      maxSelectedLabels={3}
                      className={`${defaultInputStyle} ${hasError ? 'border-red-500' : ''}`}
                      panelClassName="bg-gray-100"
                      // Color the dropdown options
                      itemTemplate={(option) => (
                        <span style={{ color: option.nameColor || 'inherit' }}>
                          {option.processedName}
                        </span>
                      )}
                      // Color the selected value
                      valueTemplate={(option) => {
                        if (!option) return <span>Select {label}</span>;
                        return (
                          <span style={{ color: option.nameColor || 'inherit' }}>
                            {option.processedName}
                          </span>
                        );
                      }}
                    />
                  );
                  break;
                case "select":
                  inputElement = (
                    <Dropdown
                      value={formData[name] || ""}
                      onChange={(e) => handlePReactChange(e, name)}
                      options={processedOptions}
                      optionLabel="processedName"
                      optionValue="_id"
                      placeholder={`Select ${label}`}
                      className={`${defaultInputStyle} ${hasError ? 'border-red-500' : ''}`}
                      panelClassName="bg-gray-100"
                      // Color the dropdown options
                      itemTemplate={(option) => (
                        <span style={{ color: option.nameColor || 'inherit' }}>
                          {option.processedName}
                        </span>
                      )}
                      // Color the selected value
                      valueTemplate={(option) => {
                        if (!option) return <span>Select {label}</span>;
                        return (
                          <span style={{ color: option.nameColor || 'inherit' }}>
                            {option.processedName}
                          </span>
                        );
                      }}
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
                      className={`${defaultInputStyle} py-2 px-3 ${hasError ? 'border-red-500' : ''}`}
                      placeholder="Enter a number"
                    />
                  );
                  break;
                case "color":
                  inputElement = (
                  <div className="relative w-9 h-9">
                    {/* Hidden color input */}
                    <input
                      type="color"
                      name={name}
                      value={formData[name] || '#000000'}
                      onChange={handleChange}
                      className="absolute opacity-0 w-full h-full cursor-pointer" // Hides the input but still functional
                    />
                    {/* Custom input box that shows the selected color as background */}
                    <div
                      style={{ backgroundColor: formData[name] || '#000000' }}
                      className="w-full h-full shadow rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    {/* Pencil Icon on top of the color box */}
                    <MdEdit
                      size={20}
                      className="absolute top-[7px] right-[8px]"
                      style={{ pointerEvents: 'none' }}
                    />
                  </div>
                  );
                  break;
                case "dateTime":
                  inputElement = (
                    <input
                      type="dateTime-local"
                      name={name}
                      value={formatLocalDateTime(formData[name])}
                      onChange={handleDateChange}
                      className={`${defaultInputStyle} py-2 px-3 ${hasError ? 'border-red-500' : ''}`}
                    />
                  );
                  break;
                case "textArea":
                  inputElement = (
                    <textarea
                      name={name}
                      value={formData[name] || ''}
                      onChange={handleChange}
                      rows="5"
                      className={`${defaultInputStyle}`}
                      style={{ resize: 'vertical', maxHeight: '300px', overflowY: 'auto' }}
                    ></textarea>
                  );
                  break;
                default:
                  inputElement = (
                    <input
                      type="text"
                      name={name}
                      value={formData[name] || ''}
                      onChange={handleChange}
                      className={`${defaultInputStyle} ${hasError ? 'border-red-500' : ''}`}
                    />
                  );
                  break;
              }
            }

              let displayClass = '';
              if (['color'].includes(inputType)) displayClass = "flex items-center gap-5 mt-4"
              // Column class controls the column span of the field input
              // Display class controls if the field input and label should flex so they're on the same line
              return (
              <div key={name} className={`${columnClass}`}>
                <div className={`${displayClass}`}>
                  <label className="text-gray-700 text-sm font-bold">
                    {label}{required && <span className="text-red-500"> *</span>} {/* Red asterisk if required */}
                  </label>
                  {inputElement}
                </div>
                {hasError && <p className="text-red-500 text-xs italic">{hasError}</p>}
              </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <GrayButton onClick={handleClose}>{isReadOnly? 'Close': 'Cancel'}</GrayButton>
            {!isReadOnly && <GreenButton type="submit">Save</GreenButton>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;