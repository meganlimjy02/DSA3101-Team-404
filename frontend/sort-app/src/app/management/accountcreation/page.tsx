import Link from 'next/link';

export default function AccountCreationPage() {
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
            <input type="text" className="form-control" id="username" aria-describedby="emailHelp" />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" />
          </div>
          {/* Additional form fields for account creation */}
          <button type="submit" className="w-100 mt-2 btn btn-primary">Create Account</button>
          <button type="button" className="w-100 mt-2 btn btn-danger">Delete Account</button>
        </form>

      </div>
    </div>
  );
}
