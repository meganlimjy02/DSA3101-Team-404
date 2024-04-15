import axios from "axios"


const BASE_URL = "http://127.0.0.1:5000"
// let loggedInUser;

export class UserAPIs {
  static loginUser = async (username: string, password: string) => {
    const response = await axios.post(BASE_URL + "/login", {
      username: username,
      password: password
    })

    // const response = await axios.post(BASE_URL + "/staff", {
    //   staff_id: "abc123",
    //   password: "newpassword"
    // }, {
    //   headers: {
    //     "Role": role
    //   }
    // })

    if (response.status == 200) {
      sessionStorage.setItem("storedUsername", username)
      // response.data.role
      // redirect /staff or /management
    } else {
      // pop up (wrong LOGIN)
    }
    
    console.log(response)
  }
}