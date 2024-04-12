import Link from 'next/link';

export default function Page() {
  return <>
    <div className='container-fluid min-vh-100 d-flex flex-column' style={{backgroundColor: "#479f76"}}>
      <div className="card m-auto p-3" style={{width: "30rem"}}>
        <div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
          <button className="nav-link active" id="nav-staff-tab" data-bs-toggle="tab" data-bs-target="#nav-staff" type="button" role="tab" aria-controls="nav-staff" aria-selected="true">
            Staff
          </button>
          <button className="nav-link" id="nav-manager-tab" data-bs-toggle="tab" data-bs-target="#nav-manager" type="button" role="tab" aria-controls="nav-manager" aria-selected="false">
            Manager
          </button>
        </div>
      
        <div className="tab-content" id="nav-tabContent">
          <div className="tab-pane fade show active" id="nav-staff" role="tabpanel" aria-labelledby="nav-staff-tab">
            <form className='p-4'>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="username" className="form-control" id="username" aria-describedby="emailHelp" />
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                <input type="password" className="form-control" id="exampleInputPassword1" />
              </div>
              <Link href="/staff">
                <button type="submit" className="w-100 mt-2 btn btn-primary">Log in</button>
              </Link>
            </form>
          </div>
          <div className="tab-pane fade" id="nav-manager" role="tabpanel" aria-labelledby="nav-manager-tab">
            <form className='p-4'>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                <input type="password" className="form-control" id="exampleInputPassword1" />
              </div>
              <Link href="/management">
                <button type="submit" className="w-100 mt-2 btn btn-primary">Log in</button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  </>
}