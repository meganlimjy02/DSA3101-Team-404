"use client"
import { UserAPIs } from '@/app/apis/userAPI';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import './acc.css';
import styles from "../page.module.css";

export default function AccountCreationPage() {

  const [accounts, setAccounts]: [any[], Function] = useState([])
  useEffect(() => {
    UserAPIs.getUserList()
      .then(data => {
        setAccounts(data)
      })
  }, []) 

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [areRolesSelected, setAreRolesSelected] = useState([true, false])
  const [areTimerRolesSelected, setAreTimerRolesSelected] = useState([true, false])
  const [deletedAlertMessage, setDeletedAlertMessage] = useState("")
  const [createdAlertMessage, setCreatedAlertMessage] = useState("")

  const toggleRole = () => {
    if (areRolesSelected[0]) {
      setAreRolesSelected([false, true])
    } else {
      setAreRolesSelected([true, false])
    }
  }
  const toggleTimer = () => {
    if (areTimerRolesSelected[0]) {
      setAreTimerRolesSelected([false, true])
    } else {
      setAreTimerRolesSelected([true, false])
    }
  }

  const handleCreateAccount = () => {
    console.log("Creating new user", username, password, areRolesSelected)
    if (areRolesSelected[1]) {
      UserAPIs.createUser(username, password, "manager")
      
    } else {
      UserAPIs.createUser(username, password, areTimerRolesSelected[0] ? "full" : "part")
    }
    setCreatedAlertMessage("Account created")
  }

  const handleDeleteAccount = async (staffId: string) => {
    UserAPIs.deleteUser(staffId)
      .then((data) => {
        console.log(data)
        setDeletedAlertMessage(data["message"])
      })
      .then(() => {
        UserAPIs.getUserList()
          .then(data => {
            setAccounts(data)
          })
      })
      .catch((err) => {

      })
  }


  return (
    <div className='container-fluid min-vh-100 d-flex flex-column p-0' style={{ backgroundColor: "#e9ecef" }}>
      <nav className="navbar navbar-light bg-success">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-light">S.O.R.T.</span>
          <div style={{justifyContent: "end"}}>
            <Link href="/management">
              <button type="button" className="btn btn-outline-light" style={{marginRight: "10px"}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-in-left me-1" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M10 3.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 1 0v2A1.5 1.5 0 0 1 9.5 14h-8A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2h8A1.5 1.5 0 0 1 11 3.5v2a.5.5 0 0 1-1 0z"/>
                  <path fill-rule="evenodd" d="M4.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H14.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                </svg>
                Back to Manager</button>
            </Link>
            {/* Trigger Button for Modal */}
            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createAccountModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill-add me-1" viewBox="0 0 16 16">
                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
              </svg>
              Create Account
            </button>
          </div>
        </div>
      </nav>


      {/* Static Modal */}
      <div className="modal fade" id="createAccountModal" aria-labelledby="createAccountModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable d-flex flex-column">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createAccountModalLabel">Create New Account</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {/* Account Creation Form */}
              <form>

                <div className="btn-group mb-2" role="group">
                  <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={areRolesSelected[0]} onClick={() => toggleRole()} />
                  <label className="btn btn-outline-primary" htmlFor="btnradio1">Staff</label>

                  <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={areRolesSelected[1]} onClick={() => toggleRole()} />
                  <label className="btn btn-outline-primary" htmlFor="btnradio2">Manager</label>
                </div>
                {/*  */}
                {areRolesSelected[0] &&
                  <div className="d-flex">
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked={areTimerRolesSelected[0]} onClick={() => toggleTimer()} />
                      <label className="form-check-label" htmlFor="flexRadioDefault1">
                        Full-time
                      </label>
                    </div>
                    <div className="form-check ms-3 mb-2">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked={areTimerRolesSelected[1]} onClick={() => toggleTimer()} />
                      <label className="form-check-label" htmlFor="flexRadioDefault2">
                        Part-time
                      </label>
                    </div>
                  </div>
                }

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input type="text" className="form-control" id="username" aria-describedby="emailHelp"  onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="new-password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" onChange={(e) => setPassword(e.target.value)} />
                </div>

                {/* Additional form fields for account creation */}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="w-100 mt-2 btn btn-primary" onClick={() => handleCreateAccount()}>Create Account</button>
            </div>
          </div>

          {createdAlertMessage != "" &&
            <div className={`alert alert-success ${styles.alertStyle}`} role="alert">
              {createdAlertMessage}
            </div>
          }
        </div>
      </div>

      {/* Account Display Section */}
      <div className="row row-cols-1 row-cols-md-2 g-4 m-3">
        {accounts.map((account, index) => (
          <div key={index} className="col">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="card-title">{account._id}</h5>
                  <p className="card-text">Role: {account.role}</p>
                </div>
                <button className="btn btn-danger" onClick={() => {handleDeleteAccount(account._id)}}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deletedAlertMessage != "" &&
        <div className={`alert alert-warning ${styles.alertStyle}`} role="alert">
          {deletedAlertMessage}
        </div>
      }
    </div>
  );
}
