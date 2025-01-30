import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../shadecn-components/dialog";
import { Button } from "../shadecn-components/button";
import { RedButton } from "../shadecn-components/redButton";
import { Alert, AlertDescription } from "../shadecn-components/alert";

const AdminTable = ({ data, sectionTitle, fields, onEdit, onDelete }) => {
  const [editItem, setEditItem] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCellValue = (value, fieldType) => {
    if (!value) return '';
    
    switch (fieldType) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'object':
        return JSON.stringify(value);
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return String(value);
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const validateField = (value, field) => {
    if (field.required && !value) {
      throw new Error(`${field.label} is required`);
    }

    switch (field.type) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error(`Invalid email format for ${field.label}`);
        }
        break;
      case 'phone':
        if (value && !/^\+?[\d\s-()]+$/.test(value)) {
          throw new Error(`Invalid phone format for ${field.label}`);
        }
        break;
      case 'date':
        if (value && isNaN(new Date(value).getTime())) {
          throw new Error(`Invalid date for ${field.label}`);
        }
        break;
    }
  };

  const handleEditClick = (item) => {
    const initialValues = {};
    fields.forEach(field => {
      initialValues[field.name] = getNestedValue(item, field.name) || '';
    });
    setEditedValues(initialValues);
    setEditItem(item);
    setError("");
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      // Validate all fields
      fields.forEach(field => {
        validateField(editedValues[field.name], field);
      });

      await onEdit(editItem._id, editedValues);
      setEditItem(null);
    } catch (err) {
      setError(err.message || "Failed to update item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      await onDelete(itemToDelete._id);
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setEditedValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setError(""); // Clear error when user makes changes
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <section className="bg-white rounded-lg shadow p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              {fields.map((field) => (
                <th key={field.name} className="p-3">
                  {field.label}
                </th>
              ))}
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item._id || index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                {fields.map((field) => (
                  <td key={field.name} className="p-3">
                    {formatCellValue(getNestedValue(item, field.name), field.type)}
                  </td>
                ))}
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleEditClick(item)}
                      disabled={isSubmitting}
                    >
                      Edit
                    </Button>
                    <RedButton 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(item)}
                      disabled={isSubmitting}
                    >
                      Delete
                    </RedButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No data available
          </div>
        )}
      </section>

      {/* Edit Dialog */}
      <Dialog open={editItem !== null} onOpenChange={() => !isSubmitting && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {sectionTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col space-y-1.5">
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  value={editedValues[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm disabled:opacity-50"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setEditItem(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog 
        open={showDeleteDialog} 
        onOpenChange={(open) => !isSubmitting && setShowDeleteDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this item? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <RedButton 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </RedButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTable;