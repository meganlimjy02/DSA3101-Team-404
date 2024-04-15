import Link from 'next/link';
import styles from "./page.module.css";

export default function Page() {
  const employees = {
    "John" : [2,7,8,11],
    "Mary" : [1,5,8,10,13]
  }

  const daysOfWeek = ['Mon1', 'Mon2', 'Tue1', 'Tue2', 'Wed1', 'Wed2', 'Thu1', 'Thu2', 'Fri1', 'Fri2', 'Sat1', 'Sat2', 'Sun1', 'Sun2'];

  const fullSchedule = [];

  // Render table header row
  const headerRow = (
    <div className='container'>
      <div className='row row-cols-15'>
        <div className='col'>Employee</div>
        {daysOfWeek.map((day, index) => (
          <div key={index} className='col'>{day}</div>
        ))}
      </div>
    </div>
  );
  fullSchedule.push(headerRow);

  // Render schedule for each employee
  for (const [key, value] of Object.entries(employees)) {
    let employeeWeekSchedule = [];
    employeeWeekSchedule.push(<div className='col'>{key}</div>);
    for (let i = 0; i < 14; i++) {
      if (!value.includes(i)) {
        employeeWeekSchedule.push(
          <div key={i} className={`col ${i % 2 === 0 ? styles.dayCell : styles.nightCell}`}>
            O
          </div>
        );
      } else {
        employeeWeekSchedule.push(
          <div key={i} className={`col ${styles.xCell}`}>
            X
          </div>
        );
      }
    }
    fullSchedule.push(
      <div key={key} className='container'>
        <div className='row row-cols-15'>
          {employeeWeekSchedule}
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar navbar-light" style={{backgroundColor: "#479f76"}}>
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-light">S.O.R.T.</span>
          <Link href="/login">
            <button type="button" className="btn btn-outline-light">Log out</button>
          </Link>
        </div>
      </nav>
      <div className='container'>
        <div>{fullSchedule}</div>
      </div>
    </>
  );
}
