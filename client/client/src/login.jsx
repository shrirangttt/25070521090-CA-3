import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './homeComp/footer';
import './App.css';

const Login = () => {
  // Partition: 'patient' or 'admin'
  const [activePartition, setActivePartition] = useState('patient');

  // Patient Mode: 'signin' or 'signup'
  const [patientMode, setPatientMode] = useState('signin');

  // Credentials
  const [patientLogin, setPatientLogin] = useState({ email: '', password: '' });
  const [adminLogin, setAdminLogin] = useState({ email: 'admin@mediconnect.health', password: 'admin123' });

  // Patient Registration Form State
  const [patientRegister, setPatientRegister] = useState({
    name: '',
    age: '',
    contact: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'General Medicine & Health Check'
  });

  // Logged-in State
  const [userSession, setUserSession] = useState(null);
  const [activeJwt, setActiveJwt] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Admin Dashboard State (All Patients from MongoDB)
  const [patientsList, setPatientsList] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({
    progress: '',
    progressNotes: '',
    prescriptions: '',
    doctor: '',
    status: ''
  });

  // Verify stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('mediconnect_token');
    const storedUser = localStorage.getItem('mediconnect_user');

    if (token) {
      setActiveJwt(token);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserSession(parsed);
          if (parsed.role === 'Administrator') {
            setActivePartition('admin');
          }
        } catch {
          // ignore parsing error
        }
      }
      fetchCurrentUser(token);
    }
  }, []);

  // Fetch all patients whenever Admin is active
  useEffect(() => {
    if (userSession?.role === 'Administrator') {
      fetchAllPatients();
    }
  }, [userSession]);

  const fetchCurrentUser = async (token) => {
    try {
      const res = await fetch('http://localhost:5001/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setUserSession((prev) => ({ ...prev, ...data.user }));
      }
    } catch {
      // retain local state if backend unavailable
    }
  };

  const fetchAllPatients = async () => {
    try {
      const res = await fetch('http://localhost:5001/getall');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatientsList(data);
      }
    } catch {
      // error fetching
    }
  };

  // 1. PATIENT SIGN IN
  const handlePatientSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const res = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientLogin)
      });
      const data = await res.json();

      if (res.ok && data.jwtToken) {
        localStorage.setItem('mediconnect_token', data.jwtToken);
        localStorage.setItem('mediconnect_user', JSON.stringify(data.user));
        setActiveJwt(data.jwtToken);
        setUserSession(data.user);
        setAlert({
          type: 'success',
          message: `Welcome back, ${data.user.name}! Your patient records are loaded from MongoDB.`
        });
      } else {
        setAlert({ type: 'danger', message: data.msg || 'Invalid patient email or password.' });
      }
    } catch {
      setAlert({
        type: 'danger',
        message: 'Could not connect to backend server on port 5001. Ensure Express server is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. PATIENT REGISTRATION (POST /create in MongoDB)
  const handlePatientSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });

    if (patientRegister.password !== patientRegister.confirmPassword) {
      setAlert({ type: 'danger', message: 'Passwords do not match! Please check and re-enter.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patientRegister.name,
          age: patientRegister.age,
          contact: patientRegister.contact,
          email: patientRegister.email,
          password: patientRegister.password,
          department: patientRegister.department,
          disease: 'New Patient Portal Registration',
          role: 'Patient'
        })
      });
      const data = await res.json();

      if (res.ok && data.acknowledged) {
        setAlert({
          type: 'success',
          message: `🎉 Account successfully registered in MongoDB! You can now sign in with ${patientRegister.email}.`
        });
        setPatientLogin({ email: patientRegister.email, password: patientRegister.password });
        setPatientMode('signin');
      } else {
        setAlert({ type: 'danger', message: data.msg || 'Registration failed in database.' });
      }
    } catch {
      setAlert({
        type: 'danger',
        message: 'Server error during registration. Ensure MongoDB backend is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. ADMINISTRATOR SIGN IN
  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const res = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminLogin)
      });
      const data = await res.json();

      if (res.ok && data.jwtToken) {
        localStorage.setItem('mediconnect_token', data.jwtToken);
        localStorage.setItem('mediconnect_user', JSON.stringify(data.user));
        setActiveJwt(data.jwtToken);
        setUserSession(data.user);
        setAlert({
          type: 'success',
          message: '👑 Administrator authentication confirmed! Full clinical management rights granted.'
        });
        fetchAllPatients();
      } else {
        setAlert({ type: 'danger', message: data.msg || 'Administrator authentication failed.' });
      }
    } catch {
      setAlert({
        type: 'danger',
        message: 'Could not connect to backend server on port 5001.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. ADMIN OPEN EDIT PROGRESS
  const openEditProgress = (patient) => {
    setEditingPatient(patient);
    setEditFormData({
      progress: patient.progress || 'Under Observation',
      progressNotes: patient.progressNotes || '',
      prescriptions: patient.prescriptions || '',
      doctor: patient.doctor || 'Dr. Sarah Jenkins',
      status: patient.status || 'Scheduled'
    });
    // Scroll to editor
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // 5. ADMIN SAVE PROGRESS (PUT /update/:id)
  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!editingPatient) return;
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5001/update/${editingPatient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();

      if (res.ok && data.acknowledged) {
        setAlert({
          type: 'success',
          message: `✅ Clinical progress updated for patient "${editingPatient.name}" in MongoDB database!`
        });
        setEditingPatient(null);
        fetchAllPatients();
      } else {
        setAlert({ type: 'danger', message: 'Failed to update progress in database.' });
      }
    } catch {
      setAlert({ type: 'danger', message: 'Error saving progress to backend.' });
    } finally {
      setLoading(false);
    }
  };

  // LOG OUT
  const handleLogout = () => {
    localStorage.removeItem('mediconnect_token');
    localStorage.removeItem('mediconnect_user');
    setActiveJwt('');
    setUserSession(null);
    setEditingPatient(null);
    setAlert({ type: 'info', message: 'You have been safely signed out.' });
  };

  return (
    <div>
      {/* Banner */}
      <div className="bg-light py-5 border-bottom">
        <div className="container text-center">
          <span className="badge badge-info px-3 py-2 text-uppercase mb-2 font-weight-bold">
            Role-Based Clinical Access System
          </span>
          <h1 className="font-weight-bold text-dark">MediConnect Authentication Portal</h1>
          <p className="lead text-muted max-w-700 mx-auto">
            Choose your portal partition: Sign in as a <strong>Patient</strong> to track your recovery, or as an{' '}
            <strong>Administrator</strong> to manage and edit patient clinical progress.
          </p>

          {/* TWO MAIN PARTITIONS SELECTOR */}
          <div className="d-flex justify-content-center mt-4">
            <div className="btn-group p-1 bg-white border rounded-pill shadow-sm" style={{ maxWidth: '480px', width: '100%' }}>
              <button
                type="button"
                className={`btn rounded-pill font-weight-bold py-2 ${
                  activePartition === 'patient' ? 'btn-info text-white shadow-sm' : 'btn-light text-muted'
                }`}
                style={{ width: '50%' }}
                onClick={() => {
                  setActivePartition('patient');
                  setAlert({ type: '', message: '' });
                }}
              >
                👤 Patient Portal
              </button>
              <button
                type="button"
                className={`btn rounded-pill font-weight-bold py-2 ${
                  activePartition === 'admin' ? 'btn-dark text-white shadow-sm' : 'btn-light text-muted'
                }`}
                style={{ width: '50%' }}
                onClick={() => {
                  setActivePartition('admin');
                  setAlert({ type: '', message: '' });
                }}
              >
                🛡️ Administrator Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-wrapper">
        {/* Global Notification Alert */}
        {alert.message && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm mb-4`} role="alert">
            <strong>{alert.type === 'success' ? '✓ ' : alert.type === 'danger' ? '✕ ' : 'ℹ '}</strong>
            {alert.message}
            <button type="button" className="close" onClick={() => setAlert({ type: '', message: '' })}>
              <span>&times;</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PARTITION 1: PATIENT PORTAL                                              */}
        {/* ========================================================================= */}
        {activePartition === 'patient' && (
          <div>
            {userSession && userSession.role !== 'Administrator' ? (
              /* LOGGED-IN PATIENT VIEW (PROGRESS TRACKER) */
              <div className="row justify-content-center">
                <div className="col-lg-9">
                  <div className="card shadow-sm border-0 rounded-lg overflow-hidden">
                    <div className="card-header bg-gradient-teal text-white p-4">
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                          <span className="badge badge-light text-info font-weight-bold px-3 py-1 mb-2">
                            Patient Health Record
                          </span>
                          <h2 className="font-weight-bold mb-1">{userSession.name}</h2>
                          <p className="mb-0 text-light opacity-90">
                            📧 {userSession.email} | 🏥 {userSession.department || 'General Medicine'}
                          </p>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline-light btn-sm mt-2 mt-md-0">
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      <h4 className="font-weight-bold text-dark mb-3">🩺 My Clinical Progress</h4>

                      {/* Visual Clinical Progress Tracker */}
                      <div className="p-4 bg-light rounded border mb-4">
                        <div className="d-flex justify-content-between mb-2">
                          <small className="font-weight-bold text-muted">Recovery Milestones:</small>
                          <span className="badge badge-success font-weight-bold px-3 py-1">
                            Current Stage: {userSession.progress || 'Treatment Ongoing'}
                          </span>
                        </div>

                        <div className="progress mb-3" style={{ height: '14px' }}>
                          <div
                            className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                            role="progressbar"
                            style={{
                              width:
                                userSession.progress === 'Discharged & Stable'
                                  ? '100%'
                                  : userSession.progress === 'Post-Op Recovery'
                                  ? '80%'
                                  : userSession.progress === 'Treatment Ongoing'
                                  ? '55%'
                                  : '25%'
                            }}
                          ></div>
                        </div>

                        <div className="d-flex justify-content-between text-muted small">
                          <span>1. Initial Consultation</span>
                          <span>2. Under Observation</span>
                          <span>3. Active Treatment</span>
                          <span>4. Discharged / Recovered</span>
                        </div>
                      </div>

                      {/* Doctor Notes & Prescriptions (Updated by Admin) */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="card h-100 border p-3 bg-white">
                            <h6 className="font-weight-bold text-dark mb-2">📋 Doctor's Clinical Remarks</h6>
                            <p className="text-muted mb-0">
                              {userSession.progressNotes ||
                                'Patient vitals stable. Clinical investigations underway under supervising physician.'}
                            </p>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="card h-100 border p-3 bg-white">
                            <h6 className="font-weight-bold text-dark mb-2">💊 Prescriptions & Medication</h6>
                            <p className="text-muted mb-0">
                              {userSession.prescriptions ||
                                'Continue prescribed hydration & prescribed standard dosage as directed.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between mt-3">
                        <Link to="/contact" className="btn btn-outline-info font-weight-bold">
                          📅 Book Follow-Up Appointment
                        </Link>
                        <small className="text-muted align-self-center">
                          🔒 Verified via JWT Token • Synced with MongoDB
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PATIENT SIGN IN & REGISTRATION TABS */
              <div className="row justify-content-center">
                <div className="col-lg-7 col-md-9">
                  <div className="card shadow-sm border rounded-lg">
                    <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                      <div className="d-flex justify-content-center border-bottom pb-3">
                        <button
                          className={`btn px-4 mr-2 ${
                            patientMode === 'signin' ? 'btn-info font-weight-bold' : 'btn-light text-muted'
                          }`}
                          onClick={() => setPatientMode('signin')}
                        >
                          🔐 Patient Sign In
                        </button>
                        <button
                          className={`btn px-4 ${
                            patientMode === 'signup' ? 'btn-info font-weight-bold' : 'btn-light text-muted'
                          }`}
                          onClick={() => setPatientMode('signup')}
                        >
                          📝 New Patient Sign Up
                        </button>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      {patientMode === 'signin' ? (
                        /* PATIENT SIGN IN FORM */
                        <form onSubmit={handlePatientSignIn}>
                          <div className="form-group mb-3">
                            <label className="font-weight-bold">Patient Email Address</label>
                            <input
                              type="email"
                              className="form-control form-control-lg"
                              placeholder="e.g. arjun.verma@example.com"
                              required
                              value={patientLogin.email}
                              onChange={(e) => setPatientLogin({ ...patientLogin, email: e.target.value })}
                            />
                          </div>

                          <div className="form-group mb-3">
                            <label className="font-weight-bold">Password</label>
                            <input
                              type="password"
                              className="form-control form-control-lg"
                              placeholder="Enter your password"
                              required
                              value={patientLogin.password}
                              onChange={(e) => setPatientLogin({ ...patientLogin, password: e.target.value })}
                            />
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary-custom btn-block btn-lg mt-4 shadow-sm"
                            disabled={loading}
                          >
                            {loading ? 'Authenticating with MongoDB...' : 'Sign In as Patient'}
                          </button>

                          <div className="mt-4 p-3 bg-light rounded border text-muted small">
                            <strong>💡 Quick Demo Patient Credentials:</strong>
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => setPatientLogin({ email: 'arjun.verma@example.com', password: 'admin123' })}
                                className="btn btn-xs btn-outline-secondary mr-2 mb-1"
                              >
                                Fill: Arjun Verma
                              </button>
                              <button
                                type="button"
                                onClick={() => setPatientLogin({ email: 'pooja.sharma@example.com', password: 'admin123' })}
                                className="btn btn-xs btn-outline-secondary mb-1"
                              >
                                Fill: Pooja Sharma
                              </button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        /* PATIENT REGISTRATION FORM */
                        <form onSubmit={handlePatientSignUp}>
                          <div className="form-row">
                            <div className="form-group col-md-8 mb-3">
                              <label className="font-weight-bold">Patient Full Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Shrirang Bodkhe"
                                required
                                value={patientRegister.name}
                                onChange={(e) => setPatientRegister({ ...patientRegister, name: e.target.value })}
                              />
                            </div>
                            <div className="form-group col-md-4 mb-3">
                              <label className="font-weight-bold">Age *</label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="e.g. 19"
                                required
                                min="1"
                                max="120"
                                value={patientRegister.age}
                                onChange={(e) => setPatientRegister({ ...patientRegister, age: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md-6 mb-3">
                              <label className="font-weight-bold">Phone Number *</label>
                              <input
                                type="tel"
                                className="form-control"
                                placeholder="+91 98765 43210"
                                required
                                value={patientRegister.contact}
                                onChange={(e) => setPatientRegister({ ...patientRegister, contact: e.target.value })}
                              />
                            </div>
                            <div className="form-group col-md-6 mb-3">
                              <label className="font-weight-bold">Email Address *</label>
                              <input
                                type="email"
                                className="form-control"
                                placeholder="patient@example.com"
                                required
                                value={patientRegister.email}
                                onChange={(e) => setPatientRegister({ ...patientRegister, email: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="form-group mb-3">
                            <label className="font-weight-bold">Primary Department</label>
                            <select
                              className="form-control"
                              value={patientRegister.department}
                              onChange={(e) => setPatientRegister({ ...patientRegister, department: e.target.value })}
                            >
                              <option value="Cardiology & Vascular Care">Cardiology & Vascular Care</option>
                              <option value="Orthopedics & Joint Care">Orthopedics & Joint Care</option>
                              <option value="Neurology & Neurosurgery">Neurology & Neurosurgery</option>
                              <option value="Pediatrics & Child Wellness">Pediatrics & Child Wellness</option>
                              <option value="General Medicine & Health Check">General Medicine & Health Check</option>
                              <option value="Dermatology & Cosmetology">Dermatology & Cosmetology</option>
                            </select>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md-6 mb-3">
                              <label className="font-weight-bold">Create Password *</label>
                              <input
                                type="password"
                                className="form-control"
                                placeholder="Min 6 characters"
                                required
                                minLength="6"
                                value={patientRegister.password}
                                onChange={(e) => setPatientRegister({ ...patientRegister, password: e.target.value })}
                              />
                            </div>
                            <div className="form-group col-md-6 mb-3">
                              <label className="font-weight-bold">Confirm Password *</label>
                              <input
                                type="password"
                                className="form-control"
                                placeholder="Re-enter password"
                                required
                                minLength="6"
                                value={patientRegister.confirmPassword}
                                onChange={(e) => setPatientRegister({ ...patientRegister, confirmPassword: e.target.value })}
                              />
                            </div>
                          </div>

                          <small className="form-text text-muted mb-3">
                            🔒 Stored in MongoDB collection <code>patient</code> with <code>bcrypt</code> password encryption.
                          </small>

                          <button
                            type="submit"
                            className="btn btn-primary-custom btn-block btn-lg shadow-sm"
                            disabled={loading}
                          >
                            {loading ? 'Writing to MongoDB...' : 'Register in MongoDB'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PARTITION 2: ADMINISTRATOR PORTAL                                         */}
        {/* ========================================================================= */}
        {activePartition === 'admin' && (
          <div>
            {userSession && userSession.role === 'Administrator' ? (
              /* LOGGED-IN ADMINISTRATOR CONSOLE (PATIENT PROGRESS EDITOR) */
              <div>
                <div className="card shadow-sm border-0 mb-4 bg-dark text-white rounded-lg p-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                      <span className="badge badge-warning text-dark font-weight-bold px-3 py-1 mb-2">
                        Supervisory Authority
                      </span>
                      <h2 className="font-weight-bold mb-1">Hospital Administrator Console</h2>
                      <p className="mb-0 text-light opacity-90">
                        Logged in as: <strong>{userSession.name}</strong> ({userSession.email}) • MongoDB Direct Access
                      </p>
                    </div>
                    <div className="mt-3 mt-md-0">
                      <button onClick={fetchAllPatients} className="btn btn-sm btn-outline-info mr-2">
                        🔄 Refresh Patients
                      </button>
                      <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">
                        🚪 Log Out Admin
                      </button>
                    </div>
                  </div>
                </div>

                {/* EDIT PATIENT PROGRESS MODAL / PANEL */}
                {editingPatient && (
                  <div className="card shadow border-info mb-4" style={{ borderWidth: '2px' }}>
                    <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                      <h5 className="font-weight-bold mb-0">
                        ✏️ Edit Patient Progress: {editingPatient.name} (Age {editingPatient.age})
                      </h5>
                      <button
                        onClick={() => setEditingPatient(null)}
                        className="btn btn-sm btn-light text-dark font-weight-bold"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <div className="card-body p-4 bg-white">
                      <form onSubmit={handleSaveProgress}>
                        <div className="form-row">
                          <div className="form-group col-md-6">
                            <label className="font-weight-bold text-dark">Clinical Progress Stage *</label>
                            <select
                              className="form-control form-control-lg font-weight-bold text-info"
                              value={editFormData.progress}
                              onChange={(e) => setEditFormData({ ...editFormData, progress: e.target.value })}
                            >
                              <option value="Under Observation">🔬 Under Observation</option>
                              <option value="Diagnostic Tests Pending">🧪 Diagnostic Tests Pending</option>
                              <option value="Surgery / Procedure Scheduled">🏥 Surgery / Procedure Scheduled</option>
                              <option value="Treatment Ongoing">💊 Treatment Ongoing</option>
                              <option value="Post-Op Recovery">🛌 Post-Op Recovery</option>
                              <option value="Discharged & Stable">✅ Discharged & Stable</option>
                            </select>
                          </div>

                          <div className="form-group col-md-6">
                            <label className="font-weight-bold text-dark">Appointment Status</label>
                            <select
                              className="form-control form-control-lg"
                              value={editFormData.status}
                              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="font-weight-bold text-dark">Doctor's Clinical Notes & Remarks *</label>
                          <textarea
                            rows="3"
                            className="form-control"
                            placeholder="Enter clinical observations, vital updates, diagnosis remarks..."
                            required
                            value={editFormData.progressNotes}
                            onChange={(e) => setEditFormData({ ...editFormData, progressNotes: e.target.value })}
                          ></textarea>
                        </div>

                        <div className="form-row">
                          <div className="form-group col-md-8">
                            <label className="font-weight-bold text-dark">Prescription & Medication</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Paracetamol 650mg, Ceftriaxone 1g IV, Bed rest"
                              value={editFormData.prescriptions}
                              onChange={(e) => setEditFormData({ ...editFormData, prescriptions: e.target.value })}
                            />
                          </div>

                          <div className="form-group col-md-4">
                            <label className="font-weight-bold text-dark">Supervising Doctor</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editFormData.doctor}
                              onChange={(e) => setEditFormData({ ...editFormData, doctor: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                          <button
                            type="button"
                            onClick={() => setEditingPatient(null)}
                            className="btn btn-secondary mr-2"
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-success btn-lg px-4" disabled={loading}>
                            {loading ? 'Saving to MongoDB...' : '💾 Save Changes to MongoDB'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* PATIENTS TABLE FOR ADMINISTRATOR */}
                <div className="card shadow-sm border rounded-lg overflow-hidden">
                  <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="font-weight-bold text-dark mb-0">
                      📋 Hospital Patient Directory ({patientsList.length} Registered)
                    </h5>
                    <small className="text-muted">Click "Edit Progress" on any patient below to update clinical notes.</small>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="thead-light">
                        <tr>
                          <th>Patient Profile</th>
                          <th>Department & Doctor</th>
                          <th>Clinical Progress Stage</th>
                          <th>Progress Remarks & Prescriptions</th>
                          <th className="text-right">Admin Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientsList.map((pt) => (
                          <tr key={pt._id}>
                            <td>
                              <div className="font-weight-bold text-dark">{pt.name}</div>
                              <small className="text-muted">{pt.email} • Age {pt.age}</small>
                            </td>
                            <td>
                              <div>{pt.department || 'General Medicine'}</div>
                              <small className="text-info">{pt.doctor || 'On-Call Officer'}</small>
                            </td>
                            <td>
                              <span
                                className={`badge px-2 py-1 font-weight-bold ${
                                  pt.progress === 'Discharged & Stable'
                                    ? 'badge-success'
                                    : pt.progress === 'Post-Op Recovery'
                                    ? 'badge-warning text-dark'
                                    : pt.progress === 'Treatment Ongoing'
                                    ? 'badge-primary'
                                    : 'badge-secondary'
                                }`}
                              >
                                {pt.progress || 'Under Observation'}
                              </span>
                            </td>
                            <td style={{ maxWidth: '300px' }}>
                              <div className="small text-truncate" title={pt.progressNotes}>
                                📝 {pt.progressNotes || 'No progress notes recorded.'}
                              </div>
                              <div className="small text-muted text-truncate" title={pt.prescriptions}>
                                💊 {pt.prescriptions || 'No prescription issued.'}
                              </div>
                            </td>
                            <td className="text-right">
                              <button
                                onClick={() => openEditProgress(pt)}
                                className="btn btn-sm btn-info font-weight-bold"
                              >
                                ✏️ Edit Progress
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* ADMINISTRATOR SIGN IN FORM */
              <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8">
                  <div className="card shadow-sm border rounded-lg">
                    <div className="card-header bg-dark text-white text-center py-4">
                      <div style={{ fontSize: '3rem' }}>🛡️</div>
                      <h4 className="font-weight-bold mb-1">Administrator & Doctor Sign In</h4>
                      <p className="small text-light opacity-90 mb-0">
                        Authorized medical staff access to supervise and update patient recovery progress.
                      </p>
                    </div>

                    <div className="card-body p-4">
                      <form onSubmit={handleAdminSignIn}>
                        <div className="form-group mb-3">
                          <label className="font-weight-bold">Admin Email</label>
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            required
                            value={adminLogin.email}
                            onChange={(e) => setAdminLogin({ ...adminLogin, email: e.target.value })}
                          />
                        </div>

                        <div className="form-group mb-3">
                          <label className="font-weight-bold">Admin Password</label>
                          <input
                            type="password"
                            className="form-control form-control-lg"
                            required
                            value={adminLogin.password}
                            onChange={(e) => setAdminLogin({ ...adminLogin, password: e.target.value })}
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn btn-dark btn-block btn-lg mt-4 font-weight-bold shadow-sm"
                          disabled={loading}
                        >
                          {loading ? 'Verifying Admin...' : 'Sign In as Administrator'}
                        </button>

                        <div className="mt-4 p-3 bg-light rounded border text-muted small">
                          <strong>🔑 Default Admin Credentials:</strong>
                          <div className="mt-1">
                            Email: <code>admin@mediconnect.health</code> | Password: <code>admin123</code>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Login;
