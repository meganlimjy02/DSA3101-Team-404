"use client"
import Link from 'next/link';
import styles from "./page.module.css";
import stylesT from "./timetables.module.css"
import Overview from './overview';
import Timetables from './timetables';

export default function Page() {
  
  const name = "John"
  const daysOfWeek = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const curSchedBusy = [0,2,3,5,7,8,10,11] // get employee schedule for this week
  const dayHtml = []
  const dateHtmlCur = []
  const dateHtmlNext = []

  // [29/4, 30/4, 1/5...]
  const datesThisWeek = []
  const datesNextWeek = []
  
  // Mon, Tue, ..., Sun : 1, 2, ..., 0
  const currentDate = new Date()
  const thisMonDate = ((currentDate.getDate()==0) ? currentDate.getDate()-6 : currentDate.getDate()-currentDate.getDay()+1)
  let thisMonth = currentDate.getMonth()+1
  let thisDate = thisMonDate
  // for loop to fill in the dates for this and next week
  for (let i=0; i<14; i++) {
    let maxDays
    if (thisMonth<=7) {
      maxDays = ((thisMonth%2) == 0 ? 30 : 31)
      maxDays = ((thisMonth==2) ? 28 : maxDays)
    } else {
      maxDays = ((thisMonth%2) == 0 ? 31 : 30)
    }
    if (thisDate>maxDays) {
      thisDate = 1
      thisMonth += 1
    }
    if (i<7) {
      datesThisWeek.push(thisDate+"/"+thisMonth)
    } else {
      datesNextWeek.push(thisDate+"/"+thisMonth)
    }
    thisDate += 1
  }

  for (let i=0; i<7; i++) {
    dayHtml.push(<div className={`col ${stylesT.cell}`} style={{fontWeight: "bold", backgroundColor: "#ffc9c9"}}>{daysOfWeek[i]}</div>)
    dateHtmlCur.push(<div className={`col ${stylesT.cellDates}`} style={{fontFamily: "Monaco", fontSize: "20px"}}>{datesThisWeek[i]}</div>)
    dateHtmlNext.push(<div className={`col ${stylesT.cellDates}`} style={{fontFamily: "Monaco", fontSize: "20px"}}>{datesNextWeek[i]}</div>)
  }


  return <>
  <div className="d-flex flex-column " style={{backgroundColor: "#fefbf6", height: "100vh"}}>
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
      <div className='d-flex' style={{justifyContent: "right", width: "80%", alignItems: "center", fontSize: "18px", fontWeight: "bold"}}>Today: {currentDate.getDate()}/{currentDate.getMonth()+1}/{currentDate.getFullYear()}
      </div>
    </div>

    <div className='d-flex'>

      <div className={styles.timetablesss}>
        <Timetables curSchedBusy={curSchedBusy} dateHtmlCur={dateHtmlCur} dateHtmlNext={dateHtmlNext} dayHtml={dayHtml}/>
      </div>

      <div className={styles.chartsss}>
        {/* helo {isSelectAll ? "it is set to true!" : "no u"} */}
        {/* {checkBug} */}
        <Overview curSchedBusy={curSchedBusy}/>
      </div>

    </div>
  </div>
  </>
}