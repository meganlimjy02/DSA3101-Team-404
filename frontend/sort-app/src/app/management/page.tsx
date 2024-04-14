import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

export default function Page() {
  // Define a function to determine the CSS class based on the shift type
  const getClassForShift = (shiftType: string) => {
    switch (shiftType) {
      case "Shift 1":
        return "bg-primary";
      case "Shift 2":
        return "bg-warning";
      case "Off":
        return "bg-secondary";
      default:
        return "";
    }
  };

  // Function to get the current date in the desired format
  const getCurrentDate = (dayOffset: number) => {
    const currentDate = new Date();
    const firstDayOfWeek = currentDate.getDate() - currentDate.getDay() + (dayOffset + 1);
    const day = new Date(currentDate.setDate(firstDayOfWeek));
    const options = { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' } as const;
    return day.toLocaleDateString(undefined, options);
  };

  // Sample data representing shifts for employees
  const shiftsData = [
    ["Employee 1", "Shift 1", "Shift 2", "Off", "Shift 1", "Off", "Shift 2", "Off"],
    ["Employee 2", "Off", "Shift 1", "Off", "Shift 2", "Shift 1", "Off", "Shift 2"],
    ["Employee 3", "Shift 1", "Off", "Shift 2", "Shift 1", "Off", "Shift 2", "Shift 1"],
    ["Employee 4", "Off", "Shift 2", "Off", "Shift 1", "Shift 1", "Shift 2", "Off"],
    ["Employee 5", "Shift 2", "Off", "Shift 1", "Shift 2", "Off", "Shift 1", "Off"],
    ["Employee 6", "Off", "Shift 1", "Shift 2", "Off", "Shift 2", "Off", "Shift 1"],
    ["Employee 7", "Shift 1", "Shift 2", "Off", "Shift 1", "Shift 2", "Off", "Off"],
    ["Employee 8", "Shift 1", "Off", "Shift 2", "Shift 1", "Off", "Off", "Shift 2"],
    ["Employee 9", "Off", "Shift 1", "Off", "Shift 2", "Shift 1", "Shift 2", "Off"],
    ["Employee 10", "Shift 1", "Off", "Shift 2", "Off", "Shift 1", "Shift 2", "Off"],
    // Add more rows of data as needed
  ];

  return (
    <>
      <nav className="navbar navbar-light bg-success">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-light">S.O.R.T.</span>
          <Link href="/login">
            <button type="button" className="btn btn-outline-light">Log out</button>
          </Link>
        </div>
      </nav>
      <div className="container mt-4">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">{getCurrentDate(0)}</th>
              <th scope="col">{getCurrentDate(1)}</th>
              <th scope="col">{getCurrentDate(2)}</th>
              <th scope="col">{getCurrentDate(3)}</th>
              <th scope="col">{getCurrentDate(4)}</th>
              <th scope="col">{getCurrentDate(5)}</th>
              <th scope="col">{getCurrentDate(6)}</th>
            </tr>
          </thead>
          <tbody>
            {shiftsData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((shift, colIndex) => (
                  <td
                    key={colIndex}
                    className={getClassForShift(shift)}
                  >
                    {shift}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
