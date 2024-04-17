import axios from "axios"
import { start } from "repl"


const BASE_URL = "http://127.0.0.1:5000"


export class TimetableAPIs {

  static getAvailability = async () => {
    const response = await axios.get(BASE_URL + "/availability")
    console.log(response.data)
  }

  static putAvailability = async (staffId: string, availability: string[]) => {
    const response = await axios.put(BASE_URL + "/availability", {
      staff_id: staffId,
      availability: availability
    })
    console.log(response.data)
  }

  static generateTimetable = async (start_date: string) => {
    const response = await axios.post(BASE_URL + "/timetable", {
      start_date
    })
    return response.data
  }

  // static getTimetable = async () => {
  //   const response = await axios.post(BASE_URL + "/timetable", {

  //   })
  // }
}