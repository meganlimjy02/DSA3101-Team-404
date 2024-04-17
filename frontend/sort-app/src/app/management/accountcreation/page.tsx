"use client"
import { UserAPIs } from '@/app/apis/userAPI';
import Link from 'next/link';
import { useState } from 'react';

export default function AccountCreationPage() {

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
    <div className='container-fluid min-vh-100 d-flex flex-column' style={{ backgroundColor: "#3DD54A" }}>
      <nav className="navbar navbar-light bg-success">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-light">S.O.R.T.</span>
          <Link href="/management">
            <button type="button" className="btn btn-outline-light">Back to Manager</button>
          </Link>
        </div>
      </nav>
      <div className="card m-auto p-3" style={{ width: "30rem" }}>
        <form className='p-4'>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input type="text" className="form-control" id="username" aria-describedby="emailHelp"  onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
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
          <button type="button" className="w-100 mt-2 btn btn-danger" onClick={() => handleDeleteAccount()}>Delete Account</button>
        </form>

      </div>
    </div>
  );
}
