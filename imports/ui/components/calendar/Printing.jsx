import { Meteor } from "meteor/meteor";

export const printSchedulesWeekly = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const lastDayOfWeek = new Date(today);
    lastDayOfWeek.setDate(today.getDate() - today.getDay() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    Meteor.call('exportCSV', firstDayOfWeek, lastDayOfWeek, (error, csv) => {
    if (error) {
        console.error("Error exporting CSV:", error);

    } else {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "download.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    });
}