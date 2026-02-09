import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { GreenButton, GrayButton, Button } from '../shadecn-components/button';

import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { MdEdit } from 'react-icons/md';
import { FaEye, FaEyeSlash, FaUpload, FaTrash, FaDownload } from 'react-icons/fa';
import CreatableSelect from 'react-select/creatable';

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { HeadshotsCollection, ResumesCollection } from '../../../api/fileCollections';


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
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

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

  const handleFileUpload = (e, fieldName, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Starting upload for:', file.name, 'Size:', file.size, 'bytes');

    const uploadCollection = fileType === 'image' ? HeadshotsCollection : ResumesCollection;
    
    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));

    const upload = uploadCollection.insert({
      file: file,
      chunkSize: 'dynamic'
    }, false);

    upload.on('start', function () {
      console.log('Upload started');
    });

    upload.on('uploaded', function (error, fileObj) {
      console.log('Upload completed event fired');
    });

    upload.on('error', function (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
      toast.error('Upload error: ' + error.reason);
    });

    upload.on('end', function (error, fileObj) {
      console.log('Upload end event - Error:', error, 'FileObj:', fileObj);
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
      
      if (error) {
        console.error('Error during upload:', error);
        toast.error('Upload failed: ' + error.reason);
      } else {
        console.log('File uploaded successfully:', fileObj);
        
        // Update formData with file info
        setFormData(prev => ({
          ...prev,
          [fieldName]: fileObj._id,
          [`${fieldName}Name`]: fileObj.name,
          [`${fieldName}Link`]: uploadCollection.link(fileObj)
        }));
        
        toast.success('File uploaded successfully!');
      }
    });

    upload.start();
    console.log('Upload.start() called');
  };

  const handleFileDelete = (fieldName, fileType) => {
    const fileId = formData[fieldName];
    if (!fileId) return;

    const methodName = fileType === 'image' ? 'files.deleteHeadshot' : 'files.deleteResume';
    
    Meteor.call(methodName, fileId, (error) => {
      if (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file: ' + error.reason);
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: null,
          [`${fieldName}Name`]: null,
          [`${fieldName}Link`]: null
        }));
        toast.success('File deleted successfully!');
      }
    });
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
    if (field.name) return;
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
        if (error.error === 'user-not-found') {
          console.warn("User not found. Opening add-user form.");
          toast.error("User not found. Opening 'Add User' form.");

          // Notify Admin.jsx to open the Add User popup
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('open-add-user-popup', { detail: formData }));
            }, 100);
          }

          // Also close the current specialist form
          handleClose();
        } else {
          console.error("PopupForm submission error:", error);
          toast.error(error.reason || "Error submitting form");
        }
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
    setShowPassword(false);
    setUploadingFiles({});
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
        
        // For categories, include focus
        if (fieldName === 'category' || fieldName === 'categories_ids') {
          const display = option.title || option.name;
          return option.focus ? `${display} (${option.focus})` : display;
        }
        
        return option.firstName && option.lastName 
          ? `${option.firstName} ${option.lastName}` 
          : option.title || option.name;
      }).join(', ');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isReadOnly? `View ${title}`: title}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Use grid layout with dynamic column span */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            {fields.map(({ name, label, inputType, colSpan, required, fileType }) => {
              
              const hasError = errors[name];
              // Dynamically set the column span
              const columnClass = colSpan ? `md:col-span-${colSpan}` : 'md:col-span-2';
              const defaultInputStyle = `w-full shadow border border-gray-400 focus:border-echo-teal focus:ring-echo-teal rounded text-gray-700 leading-tight`

              // Preprocess options to show correct label given name, title, firstName + lastName
              const rawOptions = fieldData?.[name];
              const processedOptions = Array.isArray(rawOptions)
                ? rawOptions.map((s) => {
                    let processedName;
                    
                    // For categories, include focus in the display name
                    if (name === 'category' || name === 'categories_ids') {
                      processedName = s.focus 
                        ? `${s.title} (${s.focus})` 
                        : s.title;
                    }
                    // For specialists/other items
                    else {
                      processedName = s.firstName && s.lastName 
                        ? `${s.firstName} ${s.lastName}` 
                        : s.title || s.name;
                    }
                    
                    return {
                      ...s,
                      key: s._id,
                      processedName: processedName,
                    };
                  })
                : typeof rawOptions === 'object' && rawOptions !== null
                  ? [{
                      ...rawOptions,
                      key: rawOptions._id,
                      processedName: rawOptions.firstName && rawOptions.lastName 
                        ? `${rawOptions.firstName} ${rawOptions.lastName}` 
                        : rawOptions.title || rawOptions.name
                    }]
                  : [];

              let inputElement;
              if(isReadOnly) {
                switch (inputType) {
                  case "fileUpload":
                    const fileName = formData[`${name}Name`];
                    const fileLink = formData[`${name}Link`];
                    inputElement = (
                      <div className="text-gray-800 p-2 border border-gray-200 rounded bg-gray-50">
                        {fileName ? (
                          <a href={fileLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                            <FaDownload /> {fileName}
                          </a>
                        ) : (
                          'No file uploaded'
                        )}
                      </div>
                    );
                    break;
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
                case "fileUpload":
                  const isUploading = uploadingFiles[name];
                  const hasFile = formData[name];
                  const fileName = formData[`${name}Name`];
                  
                  inputElement = (
                    <div className="space-y-2">
                      {hasFile ? (
                        <div className="flex items-center gap-2 p-2 border border-gray-300 rounded bg-gray-50">
                          <span className="flex-1 text-sm truncate">{fileName}</span>
                          <button
                            type="button"
                            onClick={() => handleFileDelete(name, fileType)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete file"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-echo-teal hover:bg-gray-50 transition-colors">
                          <FaUpload className="text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {isUploading ? 'Uploading...' : `Upload ${fileType === 'image' ? 'Image' : 'Document'}`}
                          </span>
                          <input
                            type="file"
                            accept={fileType === 'image' ? 'image/png,image/jpeg,image/jpg' : '.pdf,.doc,.docx'}
                            onChange={(e) => handleFileUpload(e, name, fileType)}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      )}
                      {isUploading && (
                        <div className="text-xs text-blue-600 text-center">Uploading...</div>
                      )}
                    </div>
                  );
                  break;
                case "multiCreatable":
                  const selectOptions = processedOptions.map(opt => ({
                    label: opt.processedName,
                    value: opt._id,
                  }));

                  const rawValue = formData[name];
                  const selectedArray = Array.isArray(rawValue)
                    ? rawValue
                    : rawValue !== undefined && rawValue !== null
                      ? [rawValue]
                      : [];

                  const selectedValues = selectedArray.map(id => {
                    const matched = selectOptions.find(o => o.value === id);
                    return matched || { label: id, value: id }; // fallback if value was newly created
                  });

                  inputElement = (
                    <CreatableSelect
                      isMulti
                      options={selectOptions}
                      value={selectedValues}
                      onChange={(newValue) => {
                        setFormData(prev => ({
                          ...prev,
                          [name]: newValue.map(v => v.value)
                        }));
                      }}
                      onCreateOption={(inputValue) => {
                        Meteor.call('participantGroups.insert', { name: inputValue }, (err, newId) => {
                          if (err) {
                            toast.error("Error creating new audience group");
                            return;
                          }

                          // Create new option and add to fieldData[name]
                          const newOption = {
                            _id: newId,
                            processedName: inputValue,
                          };

                          fieldData[name] = [...(fieldData[name] || []), newOption];

                          setFormData(prev => ({
                            ...prev,
                            [name]: [...(prev[name] || []), newId]
                          }));
                        });
                      }}
                      placeholder={`Select or type ${label}`}
                      classNamePrefix="react-select"
                    />
                  );
                  break;
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
                      type="datetime-local"
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
                  // Special handling for password fields
                  if (name === 'password') {
                    inputElement = (
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name={name}
                          value={formData[name] || ''}
                          onChange={handleChange}
                          className={`${defaultInputStyle} pr-10 ${hasError ? 'border-red-500' : ''}`}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                      </div>
                    );
                  } else {
                    inputElement = (
                      <input
                        type="text"
                        name={name}
                        value={formData[name] || ''}
                        onChange={handleChange}
                        className={`${defaultInputStyle} ${hasError ? 'border-red-500' : ''}`}
                      />
                    );
                  }
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