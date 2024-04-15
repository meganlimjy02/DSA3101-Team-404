"use client"
import Link from 'next/link';
import styles from "./page.module.css";
import stylesT from "./timetables.module.css"
import Overview from './overview';
import Timetables from './timetables';

export default function Page() {
  
  const name = "John"
  const daysOfWeek = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const dayHtml = []
  const dateHtmlCur = []
  const dateHtmlNext = []
  for (let i=0; i<7; i++) {
    dayHtml.push(<div className={`col ${stylesT.cell}`} style={{fontWeight: "bold", backgroundColor: "#ffc9c9"}}>{daysOfWeek[i]}</div>)
    dateHtmlCur.push(<div className={`col ${stylesT.cellDates}`} style={{fontFamily: "Monaco", fontSize: "20px"}}>{i+5}/4</div>)
    dateHtmlNext.push(<div className={`col ${stylesT.cellDates}`} style={{fontFamily: "Monaco", fontSize: "20px"}}>{i+12}/4</div>)
  }
  const curSched = [0,2,3,5,7,8,10,11] // get employee schedule for this week


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
    </div>

    <div className='d-flex'>

      <div className={styles.timetablesss}>
        <Timetables curSched={curSched} dateHtmlCur={dateHtmlCur} dateHtmlNext={dateHtmlNext} dayHtml={dayHtml}/>
      </div>

      <div className={styles.chartsss}>
        {/* helo {isSelectAll ? "it is set to true!" : "no u"} */}
        {/* {checkBug} */}
        <Overview curSched={curSched}/>
      </div>

    </div>
  </div>
  </>
}