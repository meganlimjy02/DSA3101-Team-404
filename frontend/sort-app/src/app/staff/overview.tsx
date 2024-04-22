// @ts-ignore
import CanvasJSReact from '@canvasjs/react-charts';
import styles from './overview.module.css'

export default function Overview({curSchedBusy} : any) {
  const currentDate = new Date()
  const currentDay = ((currentDate.getDay()==0) ? 7 : currentDate.getDay())
  const curSchedAvail = []
  for (let i=0; i<14; i++) {
    if (!curSchedBusy.includes(i)) {
      curSchedAvail.push(i)
    }
  }
  let cumShifts = 0
  for (let i=0; i<curSchedAvail.length; i++) {
    if (curSchedAvail[i]+1>currentDay*2) {break}
    cumShifts += 1
  }

  const CanvasJSChart = CanvasJSReact.CanvasJSChart;
  const shiftsRequired = curSchedAvail.length
  const shiftsCompleted = cumShifts

  const shiftsCompletedOptions = {
    title: {
      text: shiftsCompleted + " / " + shiftsRequired,
      verticalAlign: "center",
      fontSize: 36,
      fontColor: "#000000",
      fontWeight: "bold",
      fontFamily: "__Inter_aaf875",
      dockInsidePlotArea: true
    },
    animationEnabled: true,
    height: 200,
    width: 200,
    data: [{
      type: "doughnut",
      startAngle: -90,
      dataPoints: [
        { y: shiftsCompleted, name: "Completed", color: "#479f76" },
        { y: shiftsCompleted > shiftsRequired ? 0 : shiftsRequired - shiftsCompleted, name: "Remaining", color: "#e0e0e0" }
      ]
    }]
  }

  const MILLISECONDS_IN_A_WEEK = 1000 * 60 * 60 * 24 * 7
  const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24
  const thisMonDate = ((currentDate.getDay()==0) ? currentDate.getDate()-6 : currentDate.getDate()-currentDate.getDay()+1)
  let monMili = new Date(currentDate.setDate(thisMonDate)).getTime()
  let sunMili
  const previous6Weeks: string[] = []
  for (let i=0; i<6; i++) {
    sunMili = monMili - MILLISECONDS_IN_A_DAY
    monMili = monMili - MILLISECONDS_IN_A_WEEK
    let sunDay = new Date(sunMili)
    let monDay = new Date(monMili)
    let thisWeek = monDay.getDate() +"/"+ (monDay.getMonth()+1) + " - " + sunDay.getDate() +"/"+ (sunDay.getMonth()+1)
    previous6Weeks.push(thisWeek)
  }

  const datapoints: any[] = [
    { x: 1, y: 10, label: "11/03 - 17/03" },
    { x: 2, y: 12, label: "18/03 - 24/03" },
    { x: 3, y: 5, label: "25/03 - 31/03" },
    { x: 4, y: 7, label: "01/04 - 07/04" },
    { x: 5, y: 8, label: "08/04 - 14/04" },
    { x: 6, y: 8, label: ""}
  ]
  for (let i=0;i<6;i++) {
    datapoints[i].label = previous6Weeks[5-i]
  }
  console.log(datapoints)

  const pastShiftsOptions = {
    title: {
      text: "Past Shifts Completed",
      fontSize: 24,
      fontColor: "#000000",
      fontWeight: "bold",
      fontFamily: "__Inter_aaf875"
    },
    animationEnabled: true,
    axisY: [{
      includeZero: true,
      maximum: 14,
      interval: 2,
      gridColor: "#ffffff"
    }],
    height: 300,
    data: [{
      type: "line",
      dataPoints: datapoints
    }]
  }

  return <>
    <div className={`card ${styles.chartCard }`}>
      <div className={`${styles.cardLabel}`}>
        <span>Shifts Completed</span>
        <span>This Week</span>
      </div>
      <CanvasJSChart options={shiftsCompletedOptions} />
    </div>
    <div className={`card ${styles.chartCard }`}>
      <CanvasJSChart options={pastShiftsOptions} />
    </div>
  </>
}