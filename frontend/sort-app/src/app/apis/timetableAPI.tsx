import axios from "axios"
import { start } from "repl"


const BASE_URL = "http://127.0.0.1:5000"


export class TimetableAPIs {

  static getAvailability = async () => {
    const response = await axios.get(BASE_URL + "/availability")
    console.log(response.data)
    return response.data
  }

  static getAvailabilityOfUser = async (staffId: string | null) => {
    if (!staffId) {
      return null
    }
    const response = await axios.get(BASE_URL + "/availability/" + staffId)
    return response.data
  }

  static putAvailability = async (staffId: string, availability: string[]) => {
    const response = await axios.put(BASE_URL + "/availability", {
      _id: staffId,
      availability: availability
    })
    console.log(response.data)
  }

  static generateTimetable = async (startDate: Date) => {
    const dateString = startDate.getFullYear() + "-" + String(startDate.getMonth() + 1).padStart(2, "0") + "-" + String(startDate.getDate() + 1).padStart(2, "0")

    const response = await axios.post(BASE_URL + "/timetable", {
      start_date: dateString
    })
    return response.data
  }

  static generateForecast = async (start_date: string) => {
    const response = await axios.post(BASE_URL + "/forecast", {
      start_date
    })
    return response.data
  }
}