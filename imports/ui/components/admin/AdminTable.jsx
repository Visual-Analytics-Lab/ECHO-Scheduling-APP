import React, { useState, useMemo } from "react";
import { Button, TealButton,RedButton } from "../shadecn-components/button";
import DeleteModal from "../delete_modal/DeleteModal"
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
import { createColumnHelper } from "@tanstack/react-table";


const AdminTable = ({ data, sectionTitle, fields, onEdit, onDelete, onShow }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const columnHelper = createColumnHelper();

  const nameFilterFn = (row, columnId, filterValue) => {
    const firstName = row.original.firstName?.toLowerCase() || "";
    const lastName = row.original.lastName?.toLowerCase() || "";
    const fullName = `${firstName} ${lastName}`;
    return fullName.includes(filterValue.toLowerCase());
  };


  // Define the column header and data displayed. Fields with a parent collection will map ._id to .title or .name
  const columns = useMemo(() => {
    return fields.map((field) => {
      const { name, label, parentCollection } = field;
  
      // Common function to format date fields
      const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        if (isNaN(date.getTime())) return "";
        return new Intl.DateTimeFormat(undefined, {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // Ensures AM/PM format
        }).format(date);
      };
  
      // Handle special field cases
      switch (name) {
        case "fullName":
          return columnHelper.accessor(
            row => `${row.firstName} ${row.lastName}`,
            {
              id: "fullName",
              header: "Name",
              cell: ({ row }) => (
                <span style={{ color: row.original.nameColor }}>
                  {row.original.firstName} {row.original.lastName}
                </span>
              ),
              filterFn: nameFilterFn,
            }
          );
        case "phoneCombined":
        return columnHelper.accessor(
          row => `${row.phone1 || ""}\n${row.phone2 || ""}`,
          {
            id: "phoneCombined",
            header: "Phone Numbers",
            cell: ({ row }) => (
              <span>
                {row.original.phone1}<br />
                {row.original.phone2}
              </span>
            ),
          }
        );
        case "name":
        case "title":
          return {
            header: label,
            accessorKey: name,
            cell: ({ row }) => (
              <span style={{ color: row.original.nameColor }}>
                {row.original[name]}
              </span>
            ),
          };
        default:
          // Handle date fields
          if (name.includes("Date")) {
            return {
              header: label,
              accessorKey: name,
              cell: ({ row }) => formatDate(row.original[name]),
            };
          }
  
          // Handle parentCollection lookup
          if (parentCollection) {
            return {
              header: label,
              accessorKey: name,
              cell: ({ row }) => {
                const fieldValue = row.original[name];
                if (!fieldValue) return ""; // No data to display
  
                const ids = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
                const relatedDocs = parentCollection.find({ _id: { $in: ids } }).fetch();
                // Place any id fields inside this array with related docs with colored .firstName and .lastName
                if (["specialists_ids"].includes(name)) {
                  return (
                    <>
                      {relatedDocs.map((doc) => (
                        <span key={doc._id} style={{ display: 'block', color: doc.nameColor, marginBottom: "5px" }}>
                          {doc.firstName} {doc.lastName}
                        </span>
                      ))}
                    </>
                  );
                }
                // Return titles/names/roles of related doc to id uncolored
                return relatedDocs.map((doc) => (
                  <span key={doc._id} style={{ display: 'block', marginBottom: "5px" }}>
                    {doc.title || doc.name || doc.role || ""}
                  </span>
                ));
              },
            };
          }
  
          // Default case for general fields
          return {
            header: label,
            accessorKey: name,
          };
      }
    });
  }, [fields]);

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
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      await onDelete(itemToDelete._id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRowClick = (item, e) => {
    if (e.target.closest('button') || e.target.tagName == 'BUTTON') {
      return;
    }
    onShow(item);
  }

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
              <tr key={row.id} className="border-b" onClick={(e) => handleRowClick(row.original, e)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="p-3 w-[1%]">
                  <div className="flex space-x-2">
                    <TealButton  onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row.original);}}>
                      Edit
                    </TealButton>
                    <RedButton onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(row.original);
                      }}>
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
          <TealButton onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </TealButton>
          <TealButton onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </TealButton>
        </div>
        {data.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No data available
          </div>
        )}
      </section>

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        onDelete={handleDeleteConfirm}
        itemType={sectionTitle}
      />
    </>
  );
};

export default AdminTable;
