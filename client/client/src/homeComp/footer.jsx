import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5 className="text-white font-weight-bold mb-3">🏥 MediConnect Hospital</h5>
            <p className="small">
              Providing holistic and affordable multi-specialty healthcare with advanced medical technology and heartfelt dedication.
            </p>
            <p className="small text-muted">
              Continuous Assessment (CA-03) Full-Stack Project.
            </p>
          </div>

          <div className="col-md-2 col-6 mb-4">
            <h6 className="text-white mb-3 font-weight-bold">Quick Links</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/">Home</Link></li>
              <li className="mb-2"><Link to="/about">About Us</Link></li>
              <li className="mb-2"><Link to="/services">Clinical Services</Link></li>
              <li className="mb-2"><Link to="/contact">Book Appointment</Link></li>
            </ul>
          </div>

          <div className="col-md-3 col-6 mb-4">
            <h6 className="text-white mb-3 font-weight-bold">Clinical Units</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2">Cardiology & Cath Lab</li>
              <li className="mb-2">Orthopedics & Joint Replacement</li>
              <li className="mb-2">Neurology & Neurosurgery</li>
              <li className="mb-2">Pediatrics & Neonatal ICU</li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="text-white mb-3 font-weight-bold">Contact & Emergency</h6>
            <p className="small mb-1">📍 108 Health Boulevard, Silicon Valley, Pune</p>
            <p className="small mb-1">📞 Helpline: +91 (20) 2567-8900</p>
            <p className="small mb-1">✉️ care@mediconnect.health</p>
            <p className="small text-info mt-2">⏰ OPD Hours: 8:00 AM – 8:00 PM</p>
          </div>
        </div>

        <hr className="bg-secondary my-4" />

        <div className="text-center small text-muted">
          &copy; {new Date().getFullYear()} MediConnect Multi-Specialty Hospital. All rights reserved. Built with React + Express + MongoDB.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
