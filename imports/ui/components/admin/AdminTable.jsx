import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../shadecn-components/dialog";
import { Button, RedButton } from "../shadecn-components/button";
import { Alert, AlertDescription } from "../shadecn-components/alert";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender
} from "@tanstack/react-table";


const AdminTable = ({ data, sectionTitle, fields, onEdit, onDelete }) => {
  const [editItem, setEditItem] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () =>
      fields.map((field) => ({
        accessorKey: field.name,
        header: field.label,
      })),
    [fields]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const getNestedValue = (obj, path) =>
    path.split(".").reduce((acc, part) => acc && acc[part], obj);

  const validateField = (value, field) => {
    if (field.required && !value) {
      throw new Error(`${field.label} is required`);
    }
    switch (field.type) {
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error(`Invalid email format for ${field.label}`);
        }
        break;
      case "phone":
        if (value && !/^\+?[\d\s-()]+$/.test(value)) {
          throw new Error(`Invalid phone format for ${field.label}`);
        }
        break;
      case "date":
        if (value && isNaN(new Date(value).getTime())) {
          throw new Error(`Invalid date for ${field.label}`);
        }
        break;
      default:
        break;
    }
  };

  const handleEditClick = (item) => {
    const initialValues = {};
    fields.forEach((field) => {
      initialValues[field.name] = getNestedValue(item, field.name) || "";
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
      fields.forEach((field) => {
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
    setEditedValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setError("");
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />
        <table className="w-full text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-3 cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: " 🔼",
                    desc: " 🔽",
                  }[header.column.getIsSorted()] ?? null}
                </th>
              ))}
              <th className="p-3">Actions</th>
            </tr>
          ))}
        </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEditClick(row.original)}>
                      Edit
                    </Button>
                    <RedButton onClick={() => handleDeleteClick(row.original)}>
                      Delete
                    </RedButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
        {data.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No data available
          </div>
        )}
      </section>

      {/* Edit Dialog */}
      <Dialog
        open={editItem !== null}
        onOpenChange={() => !isSubmitting && setEditItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {sectionTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col space-y-1.5">
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  id={field.name}
                  type={field.type || "text"}
                  value={editedValues[field.name] || ""}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.value)
                  }
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
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
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
          <p className="py-4">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
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
              {isSubmitting ? "Deleting..." : "Delete"}
            </RedButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTable;
