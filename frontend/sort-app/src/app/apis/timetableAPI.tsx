// timetableAPI.tsx
// This class handles API calls related to timetables and staff availability using axios for HTTP requests.
// Methods include fetching, updating, and generating availability and timetable data for staff.
import axios from "axios"
import { start } from "repl"


const BASE_URL = "http://127.0.0.1:5000"


export class TimetableAPIs {

  // Fetches the availability of all staff members 
  static getAvailability = async () => {
    const response = await axios.get(BASE_URL + "/availability")
    console.log(response.data)
    return response.data
  }

  // Fetches the availability for a specific staff member by their ID
  static getAvailabilityOfUser = async (staffId: string | null) => {
    if (!staffId) {
      return null
    }
    const response = await axios.get(BASE_URL + "/availability/" + staffId)
    return response.data
  }

  // Updates availability for a specific staff member  
  static putAvailability = async (staffId: string, availability: string[]) => {
    const response = await axios.put(BASE_URL + "/availability", {
      _id: staffId,
      availability: availability
    })
    console.log(response.data)
  }

  // Retrieves the current timetable  
  static getTimetable = async () => {
    const response = await axios.get(BASE_URL + "/timetable")
    return response.data
  }

  // Generates a new timetable starting from a specified date  
  static generateTimetable = async (startDate: Date) => {
    const dateString = startDate.getFullYear() + "-" + String(startDate.getMonth() + 1).padStart(2, "0") + "-" + String(startDate.getDate() + 1).padStart(2, "0")

    const response = await axios.post(BASE_URL + "/timetable", {
      start_date: dateString
    })
    return response.data
  }

  static getForecast = async () => {
    const response = await axios.get(BASE_URL + "/forecast")
    return response.data
  }

  // Generates a forecast starting from a specified date  
  static generateForecast = async (start_date: string) => {
    const response = await axios.post(BASE_URL + "/forecast", {
      start_date
    })
    return response.data
  }
}