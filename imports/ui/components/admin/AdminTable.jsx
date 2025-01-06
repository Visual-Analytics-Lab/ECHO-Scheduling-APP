import React from "react";

const AdminTable = ({ data, sectionTitle }) => {

  const formatCellValue = (value) => {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };


  const headers = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'id') : [];

  return (
    <section className="bg-white rounded-lg shadow p-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {headers.map((header) => (
              <th key={header} className="p-3">
                {header.charAt(0).toUpperCase() + header.slice(1)} 
              </th>
            ))}
            <th className="p-3">Actions</th> 
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >

              {headers.map((header) => (
                <td key={header} className="p-3">
                  {formatCellValue(item[header])} 
                </td>
              ))}
              <td className="p-3">
                <div className="flex space-x-2">
                  <button className="text-blue-500 hover:underline">Edit</button>
                  <button className="text-red-500 hover:underline">Delete</button>
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
  );
};

export default AdminTable;