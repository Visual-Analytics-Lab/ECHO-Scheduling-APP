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
import { MdSearch, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";


const AdminTable = ({ data, sectionTitle, fields, onEdit, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  // Define the column header and data displayed. Fields with a parent collection will map ._id to .title or .name
  const columns = useMemo(
    () =>
      fields.map((field) => ({
        header: field.label,
        accessorKey: field.name,

        // If the field is an _id referencing another collection (e.g., series_id),
        //    display the name, title, etc. of the entry matching the _id.
        ...(field.parentCollection && {
          cell: ({ row }) => {
            const ids = row.original[field.name] || []; // Array of IDs
            const relatedDocs = field.parentCollection.find({ _id: { $in: ids } }).fetch();
            return relatedDocs.map(doc => doc.title || doc.name || doc.role || "").join(", ");
          }
        })
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

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
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

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="bg-white border border-gray-300 rounded-lg shadow-full-border p-4">
      {/* SEARCH BAR */}
      <div className="relative w-full mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 pr-10 border-2 border-echo-maroon rounded w-full"
        />
        <div className="absolute inset-y-0 right-0 flex items-center bg-echo-maroon text-white p-4 rounded">
          <MdSearch size={30} />
        </div>
      </div>
        <table className="w-full text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-neutral-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-3 cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: (<MdKeyboardArrowUp size={22} className="ml-1"/>),
                      desc: (<MdKeyboardArrowDown size={22} className="ml-1"/>),
                    }[header.column.getIsSorted()] ?? null}
                  </div>
                </th>
              ))}
              {/* Use w-[1%] to make the Actions column as small as possible */}
              <th className="p-3 w-[1%]">Actions</th>
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
                <td className="p-3 w-[1%]">
                  <div className="flex space-x-2">
                    <Button className="bg-echo-teal hover:bg-echo-teal-hover" onClick={() => onEdit(row.original)}>
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
        {/* TODO: Make sure these buttons even work */}
        <div className="flex justify-between items-center mt-4">
          <Button className="bg-echo-teal hover:bg-echo-teal-hover" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button className="bg-echo-teal hover:bg-echo-teal-hover" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
        {data.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No data available
          </div>
        )}
      </section>

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
