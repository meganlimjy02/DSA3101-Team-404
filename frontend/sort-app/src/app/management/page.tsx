"use client"
import React, { useState } from "react";
import styles from "./page.module.css";
import Link from 'next/link';
import { TimetableAPIs } from "../apis/timetableAPI";

export default function Page() {
  // Interface for employee shifts
  interface EmployeeShifts {
    [employee: string]: string[];
  }
  // Mon, Tue, ..., Sun : 1, 2, ..., 0
  const currentDate = new Date()
  const thisMonDate = ((currentDate.getDate()==0) ? currentDate.getDate()-6 : currentDate.getDate()-currentDate.getDay()+1)
  let thisMonth = currentDate.getMonth()+1
  let thisDate = thisMonDate
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayOfWeek = days[currentDate.getDay()-1];

  // Sample data representing shifts for employees
  let shiftsData: any = {
    'Monday1': ['F01', 'F02', 'F03', 'F05', 'F07', 'P01', 'P03', 'P05'],
    'Monday2': ['F01', 'F02', 'F03', 'F04', 'F07', 'P02', 'P04', 'P05'],
    'Tuesday1': ['F02', 'F04', 'F05', 'F06', 'P03', 'P04', 'P05'],
    'Tuesday2': ['F01', 'F02', 'F04', 'F06', 'P01', 'P02', 'P05'],
    'Wednesday1': ['F03', 'F06', 'F07', 'P01', 'P03', 'P04', 'P05'],
    'Wednesday2': ['F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'P05'],
    'Thursday1': ['F01', 'F03', 'F05', 'P02', 'P03', 'P04', 'P05'],
    'Thursday2': ['F01', 'F02', 'F04', 'F05', 'F06', 'F07', 'P02'],
    'Friday1': ['F01', 'F02', 'F03', 'F05', 'F06', 'F07', 'P01'],
    'Friday2': ['F04', 'F05', 'F06', 'F07', 'P01', 'P02', 'P04'],
    'Saturday1': ['F01', 'F02', 'F04', 'F05', 'F07', 'P01', 'P03'],
    'Saturday2': ['F01', 'F04', 'F05', 'F06', 'F07', 'P01', 'P02'],
    'Sunday1': ['F01', 'F02', 'F04', 'F05', 'F06', 'P03', 'P04'],
    'Sunday2': ['F02', 'F03', 'F04', 'F06', 'F07', 'P02', 'P03', 'P04']
  };

  // Convert shiftsData to the desired format
  const initialEmployeeShifts: EmployeeShifts = {};

  Object.keys(shiftsData).forEach(day => {
    shiftsData[day].forEach((employee: string | number) => {
      if (!initialEmployeeShifts[employee]) {
        initialEmployeeShifts[employee] = [];
      }
      const shortDay = day.substring(0, 3) + (day.endsWith("2") ? "2" : "1");
      initialEmployeeShifts[employee].push(shortDay);
    });
  });

  const [employeeShifts, setEmployeeShifts] = useState(initialEmployeeShifts)

  const loadTimeTable = async () => {
    TimetableAPIs.generateTimetable(currentDate)
    .then((data: any) => {
      const newEmployeeShifts: any = {}
      const timetable = data["timetable"]
      Object.entries(timetable).forEach(([employeeId, days]: any) => {
        Object.entries(days)
          .filter(([day, isWork]) => isWork == 1)
          .map(([day, isWork]) => day.substring(0, 3) + (day.endsWith("2") ? "2" : "1"))
          .forEach(shortDay => {
            if (!newEmployeeShifts[employeeId]) {
              newEmployeeShifts[employeeId] = [shortDay]
            } else {
              newEmployeeShifts[employeeId].push(shortDay)
            }
          })
      })
      setEmployeeShifts(newEmployeeShifts)
    })
  }

  // Define a function to determine the CSS class and text content based on the shift type
  const getClassAndTextForShift = (employee: string, day: string) => {
    if (employeeShifts[employee] && employeeShifts[employee].includes(day)) {
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
  const getCurrentDate = (dayOffset: number) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayIndex = Math.floor(dayOffset / 2);
    const dayNumber = (dayOffset % 2) + 1;
    return `${days[dayIndex]}${dayNumber}`;
  };

  return <>
      <nav className="navbar navbar-light" style={{backgroundColor: "#479f76"}}>
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
        <div className="d-flex justify-content-between align-items-center" style={{paddingLeft: "30px", paddingRight: "30px"}}>
          <h1 className="display-6">Hello, Manager!</h1>
          <div className="font-weight-bold">
            <h1 className="display-6">Today: {dayOfWeek} {currentDate.getDate()}/{currentDate.getMonth() + 1}/{currentDate.getFullYear()}</h1>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className={styles.buttonsContainer}>
          <button type="button" className="btn btn-primary" onClick={() => loadTimeTable()}>Refresh Timetable</button>
        </div>

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
            {Object.keys(employeeShifts).map((employee, employeeIndex) => (
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

    }