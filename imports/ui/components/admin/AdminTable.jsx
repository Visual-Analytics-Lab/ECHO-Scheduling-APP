import React from "react";

const AdminTable = ({ data, sectionTitle }) => {
  // Get the keys of the first object in the data to dynamically create table headers, excluding 'id'
  const headers = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'id') : [];

  return (
    <section className="bg-white rounded-lg shadow p-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {/* Render the table headers dynamically, excluding 'id' */}
            {headers.map((header) => (
              <th key={header} className="p-3">
                {header.charAt(0).toUpperCase() + header.slice(1)} {/* Capitalize header */}
              </th>
            ))}
            <th className="p-3">Actions</th> {/* Add Actions column */}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              {/* Render the data rows dynamically, excluding 'id' */}
              {headers.map((header) => (
                <td key={header} className="p-3">
                  {item[header]} {/* Display the corresponding value */}
                </td>
              ))}
              <td className="p-3 flex space-x-2">
                <button className="text-blue-500 hover:underline">Edit</button>
                <button className="text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default AdminTable;
