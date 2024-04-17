"use client"
import { UserAPIs } from '@/app/apis/userAPI';
import Link from 'next/link';
import { useState } from 'react';
import './acc.css';

export default function AccountCreationPage() {


  const accounts = [
    { username: 'user1', role: 'Part Time' },
    { username: 'user2', role: 'Full Time' },
    { username: 'user3', role: 'Part Time' },
    { username: 'user4', role: 'Full Time' },
    // Add more account objects here...
  ];

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [areRolesSelected, setAreRolesSelected] = useState([true, false])

  const toggleRole = () => {
    if (areRolesSelected[0]) {
      setAreRolesSelected([false, true])
    } else {
      setAreRolesSelected([true, false])
    }
  }

  const handleCreateAccount = () => {
    console.log("Creating new user", username, password, areRolesSelected)
    UserAPIs.createUser(username, password, areRolesSelected[0] ? "staff" : "manager")
  }

  const handleDeleteAccount = () => {

  }


  return (
    <div className='container-fluid min-vh-100 d-flex flex-column' style={{ backgroundColor: "#e9ecef" }}>
      <nav className="navbar navbar-light bg-success">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-light">S.O.R.T.</span>
          <Link href="/management">
            <button type="button" className="btn btn-outline-light">Back to Manager</button>
          </Link>
          {/* Trigger Button for Modal */}
          <button type="button" className="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#createAccountModal">
            Create Account
          </button>
        </div>
      </nav>


      {/* Static Modal */}
      <div className="modal fade" id="createAccountModal" tabIndex="-1" aria-labelledby="createAccountModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createAccountModalLabel">Create New Account</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {/* Account Creation Form */}
              <form>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input type="text" className="form-control" id="username" aria-describedby="emailHelp"  onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="new-password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="btn-group" role="group">
                  <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={areRolesSelected[0]} onClick={() => toggleRole()} />
                  <label className="btn btn-outline-primary" htmlFor="btnradio1">Staff</label>

                  <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={areRolesSelected[1]} onClick={() => toggleRole()} />
                  <label className="btn btn-outline-primary" htmlFor="btnradio2">Manager</label>
                </div>
                {/* Additional form fields for account creation */}
                <button type="button" className="w-100 mt-2 btn btn-primary" onClick={() => handleCreateAccount()}>Create Account</button>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" onClick={() => handleCreateAccount()}>Save changes</button>

            </div>
          </div>
        </div>
      </div>

      {/* Account Display Section */}
      <div className="row row-cols-1 row-cols-md-2 g-4 m-3">
        {accounts.map((account, index) => (
          <div key={index} className="col">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="card-title">{account.username}</h5>
                  <p className="card-text">{account.role}</p>
                </div>
                <button className="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
