import styles from "./timetables.module.css";
import Image from 'next/image';
import { useState } from 'react';

export default function Timetables() {

  const [isFreeShifts, setIsFreeShifts] = useState(new Array(14).fill(false))
  const [isSelectAll, setIsSelectAll] = useState(false)

  const daysOfWeek = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const dayHtml = []
  const dateHtmlCur = []
  const dateHtmlNext = []
  for (let i=0; i<7; i++) {
    dayHtml.push(<div className={`col ${styles.cell}`} style={{fontWeight: "bold", backgroundColor: "#ffc9c9"}}>{daysOfWeek[i]}</div>)
    dateHtmlCur.push(<div className={`col ${styles.cellDates}`} style={{fontFamily: "Monaco", fontSize: "20px"}}>{i+5}/4</div>)
    dateHtmlNext.push(<div className={`col ${styles.cellDates}`} style={{fontFamily: "Monaco", fontSize: "20px"}}>{i+12}/4</div>)
  }
  const curSched = [0,2,3,5,7,8,10,11] // get employee schedule for this week


  const halfTable1 = []
  for (let i=0; i<14; i+=2) { // day shifts (1st row)
    if (!curSched.includes(i)) {
      halfTable1.push(
        <div className={`col ${styles.dayCell} ${styles.cell}`}>
          O
        </div>
      )
    } else {
      halfTable1.push(
        <div className={`col ${styles.cell} ${styles.daybgCell}`}>
          X
        </div>
      )
    }
  }
  
  const halfTable2 = []
  for (let i=1; i<14; i+=2) { // night shifts (2nd row)
    if (!curSched.includes(i)) {
      halfTable2.push(
        <div className={`col ${styles.nightCell} ${styles.cell}`}>
          O
        </div>
      )
    } else {
      halfTable2.push(
        <div className={`col ${styles.cell} ${styles.nightbgCell}`}>
          X
        </div>
      )
    }
  }

  const handleCheckbox = (i: number) => {
    const updatedFreeShifts = [...isFreeShifts]
    updatedFreeShifts[i] = !updatedFreeShifts[i]

    let isAllSelected = true
    updatedFreeShifts.forEach(updatedFreeShift => {
      isAllSelected = isAllSelected && updatedFreeShift
    })
    setIsSelectAll(isAllSelected)

    setIsFreeShifts(updatedFreeShifts)
  }

  const checkBug = []
  for (let i=0; i<14; i++) {
    if (isFreeShifts[i]) {
      checkBug.push(<div>1</div>)
    } else {
      checkBug.push(<div>0</div>)
    }
  }

  const checkrow1 = []
  for (let i=0; i<14; i+=2) {
    checkrow1.push(<input type="checkbox" className="btn-check" id={"btncheck" + i} checked={isFreeShifts[i]} onClick={() => handleCheckbox(i)} autoComplete="off"/>)
    checkrow1.push(<label className={`col btn btn-outline-warning ${styles.squarebutton}`} htmlFor={"btncheck" + i}></label>)
  }

  const checkrow2 = []
  for (let i=1; i<14; i+=2) {
    checkrow2.push(<input type="checkbox" className="btn-check" id={"btncheck" + i} checked={isFreeShifts[i]} onClick={() => handleCheckbox(i)} autoComplete="off"/>)
    checkrow2.push(<label className={`col btn btn-outline-primary ${styles.squarebutton}`} htmlFor={"btncheck" + i}></label>)
  }

  const toggleSelectAll = () => {
    const state = isSelectAll
    setIsFreeShifts(new Array(14).fill(!state))
    setIsSelectAll(!state)
  }


  return <>
    <div className={`card ${styles.timetable}`}>
      <div className={` ${styles.griddy}`}>
        <h4 className={styles.header}>This week</h4>
        <div className={styles.dates}>
          <div className='d-flex'>{dateHtmlCur}</div>
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
          <div className={`d-flex ${styles.buttonrow}`}>{halfTable1}</div>
        </div>
        <div className={styles.nightschedule}>
          <div className={`d-flex ${styles.buttonrow}`}>{halfTable2}</div>
        </div>
      </div>
    </div>


    <h6>&nbsp;</h6>
    

    <div className={`card ${styles.timetable}`}>
      <div className={` ${styles.griddy}`}>
        <div className={styles.header}>
          <h4 className="text-muted">Next week</h4>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" checked={isSelectAll} onChange={() => toggleSelectAll()} />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              Select All
            </label>
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
              {checkrow1} 
          </div>
        </div>
        <div className={styles.nightschedule}>
          <div className={`d-flex ${styles.buttonrow}`}> 
              {checkrow2}
          </div>
        </div>
      </div>
    </div>
  </>
}