import { useState, useEffect } from 'react';
import Header from './homeComp/header';
import MainContent from './homeComp/mainContentCont';
import Footer from './homeComp/footer';
import './App.css';

const Home = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    // Fetch live statistics from backend server
    fetch('http://localhost:5001/getall')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPatientCount(data.length);
          const active = data.filter((p) => p.status !== 'Cancelled').length;
          setScheduledCount(active);
        }
      })
      .catch((err) => {
        console.log('Backend not connected or starting up:', err);
      });
  }, []);

  return (
    <div className="home-cont">
      {/* Hero Header Component */}
      <Header />

      {/* Live Metrics Ribbon */}
      <div className="container" style={{ marginTop: '-2.5rem', zIndex: 10 }}>
        <div className="stats-ribbon">
          <div className="row">
            <div className="col-md-3 col-6 stat-item mb-3 mb-md-0">
              <div className="stat-number">45+</div>
              <div className="stat-label">Senior Doctors</div>
            </div>
            <div className="col-md-3 col-6 stat-item mb-3 mb-md-0">
              <div className="stat-number">{patientCount > 0 ? patientCount : '120+'}</div>
              <div className="stat-label">Registered Patients</div>
            </div>
            <div className="col-md-3 col-6 stat-item">
              <div className="stat-number">{scheduledCount > 0 ? scheduledCount : '38'}</div>
              <div className="stat-label">Open / Active Slots</div>
            </div>
            <div className="col-md-3 col-6 stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Emergency Care</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Component */}
      <MainContent />

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Home;
