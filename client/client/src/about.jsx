import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './homeComp/footer';
import './App.css';

const About = () => {
  const doctors = [
    {
      name: "Dr. Sarah Jenkins",
      role: "Chief Interventional Cardiologist",
      qualification: "MD, DM Cardiology (AIIMS)",
      exp: "16+ Years Experience",
      avatar: "👩‍⚕️",
      specialty: "Heart Stenting, Arrhythmia, Hypertension"
    },
    {
      name: "Dr. Rajesh Kulkarni",
      role: "Head of Orthopedics & Joint Replacement",
      qualification: "MS Ortho, M.Ch (UK)",
      exp: "19+ Years Experience",
      avatar: "👨‍⚕️",
      specialty: "Robotic Knee Replacement, Sports Injuries"
    },
    {
      name: "Dr. Elena Rostova",
      role: "Senior Consultant Neurologist",
      qualification: "MD, DM Neurology",
      exp: "12+ Years Experience",
      avatar: "👩‍⚕️",
      specialty: "Stroke Recovery, Epilepsy, Migraine Treatment"
    },
    {
      name: "Dr. Ananya Iyer",
      role: "Pediatric & Neonatal Specialist",
      qualification: "MD Pediatrics, DCH",
      exp: "10+ Years Experience",
      avatar: "👩‍⚕️",
      specialty: "Child Wellness, Vaccinations, Neonatal ICU"
    }
  ];

  return (
    <div>
      <div className="bg-light py-5 border-bottom">
        <div className="container text-center">
          <h1 className="font-weight-bold text-dark">About MediConnect Hospital</h1>
          <p className="lead text-muted max-w-700 mx-auto">
            Setting benchmarks in quaternary healthcare, evidence-based clinical practices, and patient care standards since 2010.
          </p>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="row align-items-center mb-5">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <span className="text-uppercase text-info font-weight-bold">Our Medical Legacy</span>
            <h2 className="font-weight-bold mt-2 mb-3">Pioneering Next-Generation Clinical Excellence</h2>
            <p className="text-muted">
              MediConnect Hospital is an advanced 350-bed multi-specialty healthcare institution designed to provide comprehensive diagnostic, surgical, and therapeutic medical treatments under one roof.
            </p>
            <p className="text-muted">
              Equipped with 10 state-of-the-art modular operating rooms, 45 intensive care beds, and advanced da Vinci surgical robotic systems, we ensure minimal recovery time and the highest safety standards for all patients.
            </p>
            <div className="d-flex mt-4">
              <div className="mr-4">
                <h4 className="font-weight-bold text-teal mb-0">99.4%</h4>
                <small className="text-muted">Clinical Success Rate</small>
              </div>
              <div className="mr-4">
                <h4 className="font-weight-bold text-teal mb-0">12,000+</h4>
                <small className="text-muted">Surgeries Done</small>
              </div>
              <div>
                <h4 className="font-weight-bold text-teal mb-0">24/7</h4>
                <small className="text-muted">Critical ICU Standby</small>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="p-4 bg-white rounded shadow-sm border">
              <h4 className="font-weight-bold mb-3">Our Core Principles</h4>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex">
                  <span className="mr-3 font-weight-bold text-success">✓</span>
                  <div>
                    <strong>Patient-Centered Ethics:</strong> Transparent pricing, digital health records, and no unindicated investigations.
                  </div>
                </li>
                <li className="mb-3 d-flex">
                  <span className="mr-3 font-weight-bold text-success">✓</span>
                  <div>
                    <strong>Zero Infection Protocol:</strong> Positive pressure laminar airflow air filtration in all operating suites.
                  </div>
                </li>
                <li className="mb-3 d-flex">
                  <span className="mr-3 font-weight-bold text-success">✓</span>
                  <div>
                    <strong>Continuous Digital Monitoring:</strong> Seamless integration between outpatient OPD, laboratory, and pharmacy.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Featured Specialists */}
        <div className="section-header mt-5">
          <h2>Meet Our Medical Specialists</h2>
          <p>Consult with acclaimed doctors renowned in their respective clinical disciplines.</p>
        </div>

        <div className="row">
          {doctors.map((doc, idx) => (
            <div className="col-md-6 col-lg-3 mb-4" key={idx}>
              <div className="feature-card text-center">
                <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{doc.avatar}</div>
                <h5 className="font-weight-bold mb-1">{doc.name}</h5>
                <p className="text-info font-weight-bold small mb-2">{doc.role}</p>
                <p className="small text-muted mb-2">{doc.qualification}</p>
                <span className="badge badge-light border text-secondary mb-3">{doc.exp}</span>
                <p className="small text-muted mb-3">{doc.specialty}</p>
                <Link to="/contact" className="btn btn-sm btn-outline-info btn-block">
                  Book Consultation
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
