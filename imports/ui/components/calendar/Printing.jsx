import { Meteor } from "meteor/meteor";

export const printExcel = (option) => {
  const today = new Date();
  // For example, using the current week as the date range:
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());
  firstDayOfWeek.setHours(0, 0, 0, 0);
  const lastDayOfWeek = new Date(today);
  lastDayOfWeek.setDate(today.getDate() - today.getDay() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);

  Meteor.call("exportExcelByOption", option, firstDayOfWeek, lastDayOfWeek, (error, base64) => {
    if (error) {
      console.error("Error exporting Excel:", error);
    } else {
      // Convert the base64 string back to a binary ArrayBuffer
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${option}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  });
};
