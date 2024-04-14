"use client"
import Link from 'next/link';
import styles from "./page.module.css";
import Image from 'next/image';
import { useState } from 'react';

export default function Page() {
  const name = "John"
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

  const curTable = []

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
  curTable.push(<div className='row row-cols-7'>{halfTable1}</div>)
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
  curTable.push(<div className='row row-cols-7'>{halfTable2}</div>)

  const [checker, setChecker] = useState(new Array(14).fill(false))

  const handleCheckbox = (i: number) => {
    const newArr = [...checker]
    newArr[i] = !newArr[i]
    setChecker(newArr)
  }

  const checkBug = []
  for (let i=0; i<14; i++) {
    if (checker[i]) {
      checkBug.push(<div>1</div>)
    } else {
      checkBug.push(<div>0</div>)
    }
  }

  const checkrow1 = []
  for (let i=0; i<14; i+=2) {
    checkrow1.push(<input type="checkbox" className="btn-check" id={"btncheck" + i} checked={checker[i]} onClick={() => handleCheckbox(i)} autoComplete="off"/>)
    checkrow1.push(<label className={`col btn btn-outline-warning ${styles.squarebutton}`} htmlFor={"btncheck" + i}></label>)
  }

  const checkrow2 = []
  for (let i=1; i<14; i+=2) {
    checkrow2.push(<input type="checkbox" className="btn-check" id={"btncheck" + i} checked={checker[i]} onClick={() => handleCheckbox(i)} autoComplete="off"/>)
    checkrow2.push(<label className={`col btn btn-outline-primary ${styles.squarebutton}`} htmlFor={"btncheck" + i}></label>)
  }


  return <>
  <div className="d-flex flex-column overflow-hidden" style={{backgroundColor: "#fefbf6"}}>
    <nav className="navbar navbar-light" style={{backgroundColor: "#479f76"}}>
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1 text-light">S.O.R.T.</span>
        <Link href="/login">
          <button type="button" className="btn btn-outline-light">Log out</button>
        </Link>
      </div>
    </nav>

    <div className={styles.welcome}>
      <h1 className="display-6">Hello, {name}!</h1>
    </div>

    <div className='d-flex'>

      <div className={styles.timetablesss}>
        <div className={`card ${styles.timetable}`} style={{backgroundColor: "#f0f0f0"}}>
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
            <h4 className={`text-muted ${styles.header}`}>Next week</h4>
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
      </div>

      <div className={styles.chartsss}>
        <div className={`card ${styles.chart}`}>
          helo {checker[1] ? "it is set to true!" : "no u"}
          {checkBug}
        </div>
      </div>

    </div>
  </div>
  </>
}