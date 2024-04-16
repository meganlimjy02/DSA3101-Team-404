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
      dataPoints: [
        { x: 1, y: 10, label: "03/09 - 03/10" },
        { x: 2, y: 12, label: "04/11 - 03/12" },
        { x: 3, y: 5, label: "04/12 - 03/01" },
        { x: 4, y: 7, label: "03/09 - 03/10" },
        { x: 5, y: 8, label: "03/09 - 03/10" }
      ]
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