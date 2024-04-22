"use client"
import React, { useEffect, useState } from "react";
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
  // let shiftsData: any = {
  //   'Monday1': ['fake01', 'F02', 'F03', 'F05', 'F07', 'P01', 'P03'],
  //   'Monday2': ['fake01', 'F02', 'F03', 'F04', 'F07', 'P02', 'P04', 'P05'],
  //   'Tuesday1': ['F02', 'F04', 'F05', 'F06', 'P03', 'P04', 'P05'],
  //   'Tuesday2': ['fake01', 'F02', 'F04', 'F06', 'P01', 'P02', 'P05'],
  //   'Wednesday1': ['F03', 'F06', 'F07', 'P01', 'P03', 'P04', 'P05'],
  //   'Wednesday2': ['F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'P05'],
  //   'Thursday1': ['fake01', 'F03', 'F05', 'P02', 'P03', 'P04', 'P05'],
  //   'Thursday2': ['fake01', 'F02', 'F04', 'F05', 'F06', 'F07', 'P02'],
  //   'Friday1': ['fake01', 'F02', 'F03', 'F05', 'F06', 'F07', 'P01'],
  //   'Friday2': ['F04', 'F05', 'F06', 'F07', 'P01', 'P02', 'P04'],
  //   'Saturday1': ['fake01', 'F02', 'F04', 'F05', 'F07', 'P01', 'P03'],
  //   'Saturday2': ['fake01', 'F04', 'F05', 'F06', 'F07', 'P01', 'P02'],
  //   'Sunday1': ['fake01', 'F02', 'F04', 'F05', 'F06', 'P03', 'P04'],
  //   'Sunday2': ['F02', 'F03', 'F04', 'F06', 'F07', 'P02', 'P03', 'P04']
  // };

  // Convert shiftsData to the desired format
  // const initialEmployeeShifts: EmployeeShifts = {};

  // Object.keys(shiftsData).forEach(day => {
  //   shiftsData[day].forEach((employee: string | number) => {
  //     if (!initialEmployeeShifts[employee]) {
  //       initialEmployeeShifts[employee] = [];
  //     }
  //     const shortDay = day.substring(0, 3) + (day.endsWith("2") ? "2" : "1");
  //     initialEmployeeShifts[employee].push(shortDay);
  //   });
  // });

  // const [employeeShifts, setEmployeeShifts] = useState(initialEmployeeShifts)
  const [employeeShifts, setEmployeeShifts]: [any, Function] = useState({})
  const [costThisWeek, setCostThisWeek] = useState(7125)
  const [isTableDisplayed, setIsTableDisplayed] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // Retrieves current timetable when page loads from backend
  useEffect(() => {
    TimetableAPIs.getTimetable()
      .then((data: any) => {
        setEmployeeShifts(formatTimetableToShifts(data["timetable"]))
        setCostThisWeek(data["total_cost"])
        setIsGenerating(data["is_generating"])
        setIsTableDisplayed(true)
      })
  }, [])

  const refreshTimetable = async () => {
    TimetableAPIs.generateTimetable(currentDate)
      .then((data: any) => {
        setIsGenerating(true)
        setAlertMessage(data["message"])
        setTimeout(() => {
          setAlertMessage("")
        }, 5000)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const formatTimetableToShifts = (timetable: any) => {
    const newEmployeeShifts: any = {}
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
    return newEmployeeShifts
  }

  // Define a function to determine the CSS class and text content based on the shift type
  const getClassAndTextForShift = (employee: string, day: string) => {
    if (employeeShifts[employee] && employeeShifts[employee].includes(day)) {
      return {
        className: day.endsWith("2") ? "bg-primary text-center" : "bg-warning text-center",
        text: [<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>]
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
          <div style={{justifyContent: "end"}}>
            <Link href="/management/accountcreation">
              <button type="button" className="btn btn-outline-light" style={{marginRight: "10px"}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people-fill me-1" viewBox="0 0 16 16">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                </svg>
                Manage Accounts</button>
            </Link>
            <Link href="/login">
              <button type="button" className="btn btn-outline-light">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right me-1" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                  <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
                Log out</button>
            </Link>
          </div>
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
          <div className={styles.costCard}>  
            <div className="d-flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-coin me-1 mt-1" viewBox="0 0 16 16">
                <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
              </svg>
              <h5>This week's cost: &nbsp;</h5>
              <h5 className="text-muted"> ${costThisWeek}</h5>
            </div>
            <div className="d-flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people me-1" viewBox="0 0 16 16">
                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
              </svg>
              <h6>Total number of workers: &nbsp;</h6>
              <h6 className="text-muted">{Object.keys(employeeShifts).length}</h6>
            </div>
          </div>
          <div style={{alignContent: "end"}}>
            <button type="button" className="btn btn-primary" onClick={() => refreshTimetable()} disabled={isGenerating}>
              {isGenerating && 
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              }
              {isGenerating ? "Refreshing..." : "Refresh Timetable"}
            </button>
          </div>
        </div>
        
        {!isTableDisplayed && 
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }

        {isTableDisplayed && 
          <table className="table table-bordered">
            <thead>
              <tr>
                <th scope="col" style={{ border: '1px solid black' }}>Employee</th>
                {Array.from(Array(14).keys()).map((dayOffset) => (
                  <th key={dayOffset} scope="col" style={{ width: `${100 / 14}%`, border: '1px solid black' }}>{getCurrentDate(dayOffset)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(employeeShifts).map((employee, employeeIndex) => (
                <tr key={employeeIndex}>
                  <td style={{ border: '1px solid black' }}>{employee}</td>
                  {Array.from(Array(14).keys()).map((dayOffset) => {
                    const day = getCurrentDate(dayOffset);
                    const { className, text } = getClassAndTextForShift(employee, day);
                    return (
                      <td key={dayOffset} className={`align-middle ${className}`} style={{ width: `${100 / 14}%`, border: '1px solid black' }}>
                        <span style={{fontWeight:"bold"}}>{text}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        }

        <div className="d-flex flex-column" style={{justifyContent:"end", width:"100%"}}>
          <div className="d-flex" style={{justifyContent: "start"}}>
            <div className="bg-warning d-flex" style={{width:"50px", height:"20px", justifyContent:"center", alignItems:"center"}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>
            </div>
            <span>&nbsp;Working day shift</span>
          </div>
          <div className="d-flex" style={{justifyContent: "start"}}>
            <div className="bg-primary d-flex" style={{width:"50px", height:"20px", justifyContent:"center", alignItems:"center"}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>
            </div>
            <span>&nbsp;Working night shift</span>
          </div>
          <div className="d-flex" style={{justifyContent: "start"}}>
            <div className="bg-secondary d-flex" style={{width:"50px", height:"20px", justifyContent:"center", alignItems:"center", fontWeight:"bold"}}>
              Off
            </div>
            <span>&nbsp;Not working</span>
          </div>
        </div>
      </div>

      {alertMessage != "" &&
        <div className={`alert alert-success ${styles.alertStyle}`} role="alert">
          {alertMessage}
        </div>
      }
  </>

}