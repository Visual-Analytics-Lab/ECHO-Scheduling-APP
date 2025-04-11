import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { RedButton, TealButton, Button } from '../shadecn-components/button';


const DeleteModal = ({ 
  isOpen, 
  setIsOpen, 
  onDelete,
  itemType,
}) => {

  const handleClose = (e) => {
    if (e) e.preventDefault()
    setIsOpen(false);
  }
  const handleDelete = (e) => {
    if (e) e.preventDefault()
    onDelete();
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Confirm Deletion</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <p className="py-4">
        Are you sure you want to delete this {itemType}? <b>This action cannot be undone</b>.
        </p>

        <div className="flex justify-between gap-2 mt-6">
            <TealButton onClick={handleClose}>Cancel</TealButton>
            <RedButton onClick={handleDelete}>Delete</RedButton>
          </div>
      </div>
    </div>
  );
};

export default DeleteModal;