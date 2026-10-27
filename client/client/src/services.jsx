import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from './homeComp/footer';
import './App.css';

const Services = () => {
  const navigate = useNavigate();

  const departments = [
    {
      id: "cardio",
      name: "Cardiology & Vascular Care",
      icon: "❤️",
      leadDoctor: "Dr. Sarah Jenkins",
      timing: "Mon - Sat: 9:00 AM - 2:00 PM",
      fee: "₹800",
      description: "Comprehensive non-invasive & interventional cardiology including ECG, 2D Echo, TMT, Coronary Angiography, and Pacemaker implantation.",
      features: ["Advanced Cath Lab", "Emergency Angioplasty", "Cardiac Rehab Unit"]
    },
    {
      id: "ortho",
      name: "Orthopedics & Joint Care",
      icon: "🦴",
      leadDoctor: "Dr. Rajesh Kulkarni",
      timing: "Mon - Fri: 10:00 AM - 4:00 PM",
      fee: "₹750",
      description: "Sub-specialized care for complex bone fractures, minimally invasive arthroscopy, sports ligament tears, and robotic hip/knee replacements.",
      features: ["Robotic Knee Surgery", "Sports Medicine Rehab", "Spine Stabilization"]
    },
    {
      id: "neuro",
      name: "Neurology & Neurosurgery",
      icon: "🧠",
      leadDoctor: "Dr. Elena Rostova",
      timing: "Tue - Sat: 11:00 AM - 5:00 PM",
      fee: "₹900",
      description: "Cutting-edge diagnostic evaluation and treatment for chronic migraines, epilepsy, stroke, parkinsonism, and peripheral nerve disorders.",
      features: ["Stroke Recovery Suite", "24hr Video EEG Monitoring", "Micro-Neurosurgery"]
    },
    {
      id: "pediatrics",
      name: "Pediatrics & Child Wellness",
      icon: "👶",
      leadDoctor: "Dr. Ananya Iyer",
      timing: "Daily: 9:00 AM - 1:00 PM",
      fee: "₹600",
      description: "Holistic child healthcare from birth through adolescence, covering immunizations, developmental milestones, and pediatric intensive care.",
      features: ["Level III Neonatal ICU", "Growth Assessment", "Painless Immunization"]
    },
    {
      id: "general",
      name: "General Medicine & Health Check",
      icon: "🩺",
      leadDoctor: "Dr. Vikram Malhotra",
      timing: "Mon - Sun: 8:00 AM - 8:00 PM",
      fee: "₹500",
      description: "Primary health consultations, diabetes & hypertension management, infectious disease care, and executive full-body wellness screening.",
      features: ["Same-Day Blood Reports", "Executive Health Packages", "Flu Vaccination"]
    },
    {
      id: "ent-derma",
      name: "Dermatology & Cosmetology",
      icon: "✨",
      leadDoctor: "Dr. Meera Bansal",
      timing: "Mon - Fri: 2:00 PM - 7:00 PM",
      fee: "₹700",
      description: "Clinical skin disease management for eczema, psoriasis, acne therapy, allergic rashes, and dermatological laser procedures.",
      features: ["Skin Biopsy Diagnostics", "Laser Therapy Unit", "Allergy Patch Testing"]
    }
  ];

  const handleBookDept = (deptName, docName) => {
    // Navigate to contact with pre-selected state
    navigate('/contact', { state: { selectedDept: deptName, selectedDoc: docName } });
  };

  return (
    <div>
      <div className="bg-light py-5 border-bottom">
        <div className="container text-center">
          <h1 className="font-weight-bold text-dark">Clinical Services & Departments</h1>
          <p className="lead text-muted max-w-700 mx-auto">
            Explore our specialized clinical departments, consulting doctors, and schedule your appointment online.
          </p>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="row">
          {departments.map((dept) => (
            <div className="col-lg-4 col-md-6 mb-4" key={dept.id}>
              <div className="feature-card d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <span style={{ fontSize: '2.5rem', marginRight: '12px' }}>{dept.icon}</span>
                    <div>
                      <h5 className="font-weight-bold mb-0 text-dark">{dept.name}</h5>
                      <small className="text-info font-weight-bold">{dept.leadDoctor}</small>
                    </div>
                  </div>

                  <p className="text-muted small mb-3">{dept.description}</p>

                  <div className="p-2 bg-light rounded mb-3 small">
                    <div className="text-secondary"><strong>Consulting:</strong> {dept.timing}</div>
                    <div className="text-secondary"><strong>OPD Consultation Fee:</strong> {dept.fee}</div>
                  </div>

                  <div className="mb-3">
                    <small className="text-uppercase font-weight-bold text-muted d-block mb-1">Key Facilities:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {dept.features.map((feat, fidx) => (
                        <span key={fidx} className="badge badge-light border text-muted mr-1 mb-1">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookDept(dept.name, dept.leadDoctor)}
                  className="btn btn-outline-info btn-block font-weight-bold mt-2"
                >
                  📅 Book in {dept.name.split(" ")[0]}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Diagnostic Services Banner */}
        <div className="card bg-white border shadow-sm p-4 mt-3">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="font-weight-bold text-dark mb-1">Looking for Pathology or Imaging Tests?</h4>
              <p className="text-muted mb-0">
                Our 24-hour diagnostic center offers home sample collection and online report downloads within 4 hours.
              </p>
            </div>
            <div className="col-md-4 text-md-right mt-3 mt-md-0">
              <Link to="/contact" className="btn btn-primary-custom">
                Inquire Diagnostic Tests
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;
