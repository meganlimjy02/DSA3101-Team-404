import axios from "axios"


const BASE_URL = "http://127.0.0.1:5000"
// let loggedInUser;

export class UserAPIs {
  static createUser = async (username: string, password: string, role: "full" | "part" | "manager") => {
    const headers = {
      Role: "manager"
    }
    const response = await axios.post(BASE_URL + "/staff", {
      _id: username,
      password,
      role
    }, {headers})
    console.log(response)
  }

  static deleteUser = async (staff_id: string) => {
    const headers = {
      Role: "manager"
    }
    const response = await axios.delete(BASE_URL + "/staff/" + staff_id, {headers})
    return response.data
  }

  static loginUser = async (username: string, password: string) => {
    const response = await axios.post(BASE_URL + "/login", {
      username: username,
      password: password
    })

    return response

    // const response = await axios.post(BASE_URL + "/staff", {
    //   staff_id: "abc123",
    //   password: "newpassword"
    // }, {
    //   headers: {
    //     "Role": role
    //   }
    // })

    //console.log('hello')

    // return axios.post(BASE_URL + "/login", {
    //   username,
    //   password
    // })
    // .then((response) => response)
    // .catch((err) => console.log(err))
  }
  //   if (response.status == 200) {
  //     sessionStorage.setItem("storedUsername", username)
  //     // response.data.role
  //     // redirect /staff or /management
  //   } else {
  //     // pop up (wrong LOGIN)
  //   }
  // }
}