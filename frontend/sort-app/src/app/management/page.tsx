import React from "react";
import styles from "./page.module.css";
import Link from 'next/link';

export default function Page() {
  // Define a function to determine the CSS class and text content based on the shift type
  const getClassAndTextForShift = (employee, day) => {
    if (shiftsData[employee] && shiftsData[employee].includes(day)) {
      return {
        className: day.endsWith("2") ? "bg-primary text-center" : "bg-warning text-center",
        text: "O"
      };
    }
    return {
      className: "bg-secondary text-center",
      text: "Off"
    };
  };

  // Function to get the current date in the desired format
  const getCurrentDate = (dayOffset) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayIndex = Math.floor(dayOffset / 2);
    const dayNumber = (dayOffset % 2) + 1;
    return `${days[dayIndex]}${dayNumber}`;
  };

  // Sample data representing shifts for employees
  const shiftsData = {
    'F01': ['Mon1', 'Mon2', 'Tue2', 'Thu1', 'Thu2', 'Fri1', 'Sat1', 'Sun1'],
    'F02': ['Mon1', 'Mon2', 'Tue1', 'Tue2', 'Wed2', 'Thu2', 'Fri1', 'Sat1'],
    'F03': ['Mon1', 'Wed2', 'Thu1', 'Fri1'],
    'F04': ['Mon2', 'Tue2', 'Thu2', 'Fri2', 'Sat2', 'Sun1'],
    'F05': ['Mon1', 'Tue1', 'Thu1', 'Thu2', 'Fri1', 'Sat1', 'Sun1'],
    'F06': ['Tue1', 'Tue2', 'Wed1', 'Wed2', 'Fri2', 'Sun1'],
    'F07': ['Mon1', 'Mon2', 'Wed1', 'Wed2', 'Thu1', 'Thu2'],
    'P01': ['Mon1', 'Tue1', 'Wed1', 'Fri1', 'Fri2', 'Sat1'],
    'P02': ['Tue2', 'Thu2', 'Thu1', 'Fri2', 'Sat2', 'Sun2'],
    'P03': ['Mon1', 'Tue1', 'Wed1', 'Thu1', 'Sat1', 'Sun1'],
    'P04': ['Mon2', 'Tue2', 'Wed2', 'Thu2', 'Fri2', 'Sun2'],
    'P05': ['Mon1', 'Mon2', 'Tue1', 'Wed1', 'Wed2', 'Sun1', 'Sun2']
  };

  return (
    <>
      <nav className="navbar navbar-light bg-success">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-light">S.O.R.T.</span>
          <Link href="/management/accountcreation">
            <button type="button" className="btn btn-outline-light">Create Account</button>
          </Link>
          <Link href="/login">
            <button type="button" className="btn btn-outline-light">Log out</button>
          </Link>
        </div>
      </nav>

      <div className={styles.welcome}>
        <h1 className="display-6">Hello, Manager!</h1>
      </div>

      <div className="container mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col" style={{ border: '1px solid black' }}>Employee</th>
              {[...Array(14).keys()].map((dayOffset) => (
                <th key={dayOffset} scope="col" style={{ width: `${100 / 14}%`, border: '1px solid black' }}>{getCurrentDate(dayOffset)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(shiftsData).map((employee, employeeIndex) => (
              <tr key={employeeIndex}>
                <td style={{ border: '1px solid black' }}>{employee}</td>
                {[...Array(14).keys()].map((dayOffset) => {
                  const day = getCurrentDate(dayOffset);
                  const { className, text } = getClassAndTextForShift(employee, day);
                  return (
                    <td key={dayOffset} className={`align-middle ${className}`} style={{ width: `${100 / 14}%`, border: '1px solid black' }}>
                      <span>{text}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}