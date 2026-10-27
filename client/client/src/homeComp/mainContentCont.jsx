import React from 'react';
import { Link } from 'react-router-dom';

const MainContent = () => {
  return (
    <div className="section-wrapper">
      <div className="section-header">
        <h2>Why Families Trust MediConnect</h2>
        <p>Delivering patient-centric healthcare with world-class medical specialists and digital ease.</p>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="feature-card">
            <span className="feature-icon">🩺</span>
            <h4>Board-Certified Doctors</h4>
            <p className="text-muted">
              Over 120+ senior consultants in Cardiology, Neurology, Orthopedics, Oncology, and General Medicine.
            </p>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h4>Instant Online Booking</h4>
            <p className="text-muted">
              Skip hospital queues. Book your appointment in seconds and track your clinical status in real time.
            </p>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="feature-card">
            <span className="feature-icon">🧪</span>
            <h4>Modern Diagnostic Labs</h4>
            <p className="text-muted">
              NABL accredited high-precision pathology, 3T MRI, 128-slice CT scans, and digital health records.
            </p>
          </div>
        </div>
      </div>

      <div className="jumbotron bg-light border p-5 mt-4 rounded-lg text-center">
        <h3>Need Immediate Medical Attention?</h3>
        <p className="lead text-muted">
          Our Emergency & Trauma team is on standby 24 hours a day, 7 days a week.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-3">
          <Link to="/contact" className="btn btn-primary-custom mr-3">
            📅 Book An Appointment Now
          </Link>
          <a href="tel:18001234567" className="btn btn-outline-danger font-weight-bold">
            📞 Emergency: 1800-123-4567
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
