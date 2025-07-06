import React from 'react';
import { Link } from "react-router-dom"




function navbar() {
  return (

    <nav className="navbar navbar-expand-lg navbar-light bg-light py-3 shadow-sm">
      <div className="container-fluid">

        <Link className="navbar-brand me-auto" to="/" style={{marginLeft:"5rem"}}>
          <p style={{fontFamily: "Playwrite BE WAL"}}>promo</p>
       
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">

          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 px-5 " style={{marginLeft:"10rem"}}>
            <li className="nav-item px-1">
              <Link className="nav-link " aria-current="page" to="/">Home</Link>
            </li>
            <li className="nav-item px-1">
              <Link className="nav-link" aria-current="page"  to="/Features">Features</Link>
            </li>
            <li className="nav-item px-1">
              <Link className="nav-link" aria-current="page"  to="/Abaout">About</Link>
            </li>
            <li className="nav-item px-1">
              <Link className="nav-link" aria-current="page"  to="/Contact">Contact</Link>
            </li>
                <li className="nav-item px-1" >
        <Link className="nav-link" aria-current="page"  to="/JoinPage">Create Account</Link>
            </li>
          </ul>


          <div className="d-flex flex-column flex-lg-row ms-lg-auto mt-3 mt-lg-0">

           

            <Link to="/Login" className="btn btn-primary" type="button" style={{marginRight:"5rem"}}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default navbar;
