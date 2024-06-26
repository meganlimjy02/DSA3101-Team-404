import styles from "./timetables.module.css";
import stylesC from "./editable.module.css";
import Image from 'next/image';
import { JSX, useEffect, useState } from 'react';
import { TimetableAPIs } from "../apis/timetableAPI";

export default function Editable({dateHtmlNext, dayHtml}: any) {
  const shiftList = ['Monday1','Monday2','Tuesday1','Tuesday2','Wednesday1','Wednesday2'
  ,'Thursday1','Thursday2','Friday1','Friday2','Saturday1','Saturday2','Sunday1','Sunday2']

  const [isSelectedShifts, setIsSelectedShifts] = useState(new Array(14).fill(false))
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    TimetableAPIs.getAvailabilityOfUser(sessionStorage.getItem("storedUser"))
      .then(data => {
        if (data) {
          const prefilledShifts = new Array(14).fill(false)
          data['availability'].forEach((shift: string) => {
            let shiftIndex = shiftList.indexOf(shift)
            if (shiftIndex != -1) {
              prefilledShifts[shiftIndex] = true
            }
          })
          setIsSelectedShifts(prefilledShifts)
          setIsSubmitted(true)
        }
      })
  }, []) 

  const transformedShifts: string[] = []
  for (let i=0; i<14; i++) {
    if (isSelectedShifts[i]) {
      transformedShifts.push(shiftList[i])
    }
  }

  const handleCheckbox = (i: number) => {
    const updatedSelectedShifts = [...isSelectedShifts]
    updatedSelectedShifts[i] = !updatedSelectedShifts[i]

    let isAllSelected = true
    updatedSelectedShifts.forEach(updatedSelectedShift => {
      isAllSelected = isAllSelected && updatedSelectedShift
    })
    setIsSelectAll(isAllSelected)

    setIsSelectedShifts(updatedSelectedShifts)
  }

  const toggleSelectAll = () => {
    const state = isSelectAll
    setIsSelectedShifts(new Array(14).fill(!state))
    setIsSelectAll(!state)
  }

  const toggleSubmit = () => {
    const state = isSubmitted
    setIsSubmitted(!state)
    // TimetableAPIs.postTimetable("2024-04-15")
    TimetableAPIs.putAvailability(sessionStorage.getItem("storedUser")!, transformedShifts)
  }

  const checkBug = []
  for (let i=0; i<14; i++) {
    if (isSelectedShifts[i]) {
      checkBug.push(<div>1</div>)
    } else {
      checkBug.push(<div>0</div>)
    }
  }

  const checkrow1: JSX.Element[] = []
  for (let i=0; i<14; i+=2) {
    checkrow1.push(<input type="checkbox" className="btn-check" id={"btncheck" + i} checked={isSelectedShifts[i]} onClick={() => handleCheckbox(i)} autoComplete="off"/>)
    checkrow1.push(<label className={`col btn btn-outline-warning ${stylesC.squarebutton}`} htmlFor={"btncheck" + i}></label>)
  }
  const checkrow1Sub: JSX.Element[] = []
  for (let i=0; i<14; i+=2) {
    checkrow1Sub.push(<input type="checkbox" className="btn-check" id={"btncheck" + i} checked={isSelectedShifts[i]} onClick={() => handleCheckbox(i)} autoComplete="off" disabled/>)
    checkrow1Sub.push(<label className={`col btn btn-outline-warning ${stylesC.squarebutton}`} htmlFor={"btncheck" + i}></label>)
  }

  const checkrow2: JSX.Element[] = []
  for (let i=1; i<14; i+=2) {
    checkrow2.push(<input type="checkbox" className="btn-check" id={"btncheck" + i} checked={isSelectedShifts[i]} onClick={() => handleCheckbox(i)} autoComplete="off"/>)
    checkrow2.push(<label className={`col btn btn-outline-primary ${stylesC.squarebutton}`} htmlFor={"btncheck" + i}></label>)
  }
  const checkrow2Sub: JSX.Element[] = []
  for (let i=1; i<14; i+=2) {
    checkrow2Sub.push(<input type="checkbox" className="btn-check" id={"btncheck" + i} checked={isSelectedShifts[i]} onClick={() => handleCheckbox(i)} autoComplete="off" disabled/>)
    checkrow2Sub.push(<label className={`col btn btn-outline-primary ${stylesC.squarebutton}`} htmlFor={"btncheck" + i}></label>)
  }

  const checkAll: JSX.Element[] = []
  checkAll.push(<input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" checked={isSelectAll} onChange={() => toggleSelectAll()} />)
  checkAll.push(<label className="form-check-label" htmlFor="flexCheckDefault">Select All</label>)
  const checkAllSub: JSX.Element[] = []
  checkAllSub.push(<input className="form-check-input" type="checkbox" value="" id="flexCheckDisabled" checked={isSelectAll} onChange={() => toggleSelectAll()} disabled />)
  checkAllSub.push(<label className="form-check-label" htmlFor="flexCheckDisabled">Select All</label>)

  const toggleDisable1 = (isSubmitted: boolean) => {
    if (!isSubmitted) {
      return (checkrow1)
    } else {
      return (checkrow1Sub)
    }
  }
  const toggleDisable2 = (isSubmitted: boolean) => {
    if (!isSubmitted) {
      return (checkrow2)
    } else {
      return (checkrow2Sub)
    }
  }
  const toggleDisableCheckAll = (isSubmitted: boolean) => {
    if (!isSubmitted) {
      return (checkAll)
    } else {
      return (checkAllSub)
    }
  }


  return <>
    <div className={`card ${styles.timetable}`} style={{backgroundColor: (isSubmitted ? "#e6e6e6":"#FFFFFF")}}>
      <div className={` ${styles.griddy}`}>
        <div className={styles.header}>
          <h4 className="text-muted">Next week</h4>
          <div className="form-check">
            {toggleDisableCheckAll(isSubmitted)}
          </div>
        </div>
        <div className={styles.dates}>
          <div className='d-flex'>{dateHtmlNext}</div>
        </div>
        <div className={styles.days}>
          <div className={`d-flex ${styles.buttonrow}`}>{dayHtml}</div>
        </div>
        <div className={styles.dayshift}>
          <Image
            src="/day.avif"
            width={30}
            height={30}
            alt="day icon"
          /> Day</div>
        <div className={styles.nightshift}>
          <Image
              src="/night.png"
              width={30}
              height={30}
              alt="night icon"
            /> Night</div>
        <div className={styles.dayschedule}>
          <div className={`d-flex ${styles.buttonrow}`}>
              {toggleDisable1(isSubmitted)} 
          </div>
        </div>
        <div className={styles.nightschedule}>
          <div className={`d-flex ${styles.buttonrow}`}> 
              {toggleDisable2(isSubmitted)}
          </div>
        </div>
      </div>
      
      <div className={stylesC.submitbutton} style={{width: "100%"}}>
        <input type="checkbox" className="btn-check" id="submitbtn" checked={isSubmitted} onClick={() => toggleSubmit()} autoComplete="off" />
        <label className={`btn btn-success`} style={{width:"20%", backgroundColor:"#479f76"}} htmlFor="submitbtn">{isSubmitted ? "Submitted":"Submit"}</label>
      </div>
    </div>
  </>

}