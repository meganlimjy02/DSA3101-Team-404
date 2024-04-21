"use client"

import styles from './page.module.css'
import { SyntheticEvent, useState } from 'react';
import { UserAPIs } from '../apis/userAPI';
import { useRouter } from 'next/navigation';
import { error } from 'console';

export default function Page() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isWrongLogin, setIsWrongLogin] = useState(false)

  const handleStaffLogin = async () => {
    UserAPIs.loginUser(username,password)
    .then(res => {
      console.log("attempting to log in staff...")
      console.log(res.data)
      if (res.data.role != "full" && res.data.role != "part") {
        throw new Error()
      }
      sessionStorage.setItem("storedUser",username)
      sessionStorage.setItem("storedRole",res.data.role)
      // console.log(res)
      router.push("/staff")
    })
    .catch(err => {
      console.log(err)
      setIsWrongLogin(true)
    })
  }

  const handleManagerLogin = async () => {
    UserAPIs.loginUser(username,password)
    .then(res => {
      if (res.data.role != "manager") {
        throw new Error()
      }
      sessionStorage.setItem("storedUser",username)
      sessionStorage.setItem("storedRole",res.data.role)
      // console.log(res)
      router.push("/management")
    })
    .catch(err => {
      console.log(err)
      setIsWrongLogin(true)
    })
  }

  const errorPopup = [
    <div className="alert alert-danger" role="alert">
      Wrong credentials!
    </div>]
  const displayErrorPopup = (isWrong: boolean) => { 
    if (isWrong) {
      return errorPopup
    }
  }

  return <>
    <div className='container-fluid min-vh-100 d-flex flex-column' style={{backgroundColor: "#479f76"}}>
      {/* <div className={styles.header}>
        <h1 className="m-auto" style={{color: "#FFFFFF"}}>S.O.R.T.</h1>
      </div> */}
      <div className="card m-auto p-3" style={{width: "30rem"}}>
        <div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
          <button className="nav-link active" id="nav-staff-tab" data-bs-toggle="tab" data-bs-target="#nav-staff" type="button" role="tab" >
            Staff
          </button>
          <button className="nav-link" id="nav-manager-tab" data-bs-toggle="tab" data-bs-target="#nav-manager" type="button" role="tab" >
            Manager
          </button>
        </div>
      
        <div className="tab-content" id="nav-tabContent">
          <div className="tab-pane fade show active" id="nav-staff" role="tabpanel">
            <form className='p-4'>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                <input type="password" className="form-control" id="exampleInputPassword1" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {/* <Link href="/staff"> */}
                <button type="button" className="w-100 mt-2 btn btn-success" style={{backgroundColor: "#479f76"}} onClick={() => handleStaffLogin()}>Log in</button>
              {/* </Link> */}
            </form>
          </div>
          <div className="tab-pane fade" id="nav-manager" role="tabpanel">
            <form className='p-4'>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                <input type="password" className="form-control" id="exampleInputPassword1" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {/* <Link href="/management"> */}
                <button type="button" className="w-100 mt-2 btn btn-success" onClick={() => handleManagerLogin()}>Log in</button>
              {/* </Link> */}
            </form>
          </div>
        </div>
      </div>

      <div>
        {displayErrorPopup(isWrongLogin)}
      </div>

    </div>
  </>
}