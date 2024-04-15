import styles from "./timetables.module.css";
import Image from 'next/image';
import Editable from './editable';

export default function Timetables({curSched, dateHtmlCur, dateHtmlNext, dayHtml} : any) {

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
          
        </div>
      )
    }
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

    <Editable dateHtmlNext={dateHtmlNext} dayHtml={dayHtml} />

    
  </>
}