"use client"
import Link from 'next/link';
import styles from "./page.module.css";
import Overview from './overview';
import Timetables from './timetables';

export default function Page() {
  
  const name = "John"

  return <>
  <div className="d-flex flex-column overflow-hidden" style={{backgroundColor: "#fefbf6", height: "100vh"}}>
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
        <Timetables />
      </div>

      <div className={styles.chartsss}>
        {/* helo {isSelectAll ? "it is set to true!" : "no u"} */}
        {/* {checkBug} */}
        <Overview />
      </div>

    </div>
  </div>
  </>
}