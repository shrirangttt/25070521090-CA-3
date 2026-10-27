import React from 'react';

const Header = () => {
  return (
    <header className="hero-banner">
      <div className="container">
        <span className="badge badge-light px-3 py-2 text-uppercase mb-3 font-weight-bold" style={{ color: '#0f766e' }}>
          NABH & JCI Accredited Super-Specialty Hospital
        </span>
        <h1 className="hero-title">Compassionate Care, Advanced Medicine</h1>
        <p className="hero-subtitle">
          MediConnect brings premier clinical expertise, 24/7 emergency response, and seamless digital appointment booking to patients across India.
        </p>
        <div className="hero-badges">
          <div className="badge-pill-custom">🚨 24x7 Trauma & Emergency</div>
          <div className="badge-pill-custom">🔬 Advanced Robotic Surgery</div>
          <div className="badge-pill-custom">💊 Tele-Consultation Available</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
