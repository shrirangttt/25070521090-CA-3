import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './homeComp/footer';
import './App.css';

const Contact = () => {
  const location = useLocation();

  // Active Tab: 'book', 'manage', 'login'
  const [activeTab, setActiveTab] = useState('book');

  // Pre-fill from Services page if passed
  const preSelectedDept = location.state?.selectedDept || 'Cardiology & Vascular Care';
  const preSelectedDoc = location.state?.selectedDoc || 'Dr. Sarah Jenkins';

  // Booking Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    contact: '',
    email: '',
    password: '',
    department: preSelectedDept,
    doctor: preSelectedDoc,
    disease: '',
    appointmentDate: '',
    appointmentTime: '10:00 AM'
  });

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('mediconnect_token') || '');

  // Appointments List (for Manage Tab)
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Update selected dept/doc if location changes
  useEffect(() => {
    if (location.state?.selectedDept) {
      setFormData((prev) => ({
        ...prev,
        department: location.state.selectedDept,
        doctor: location.state.selectedDoc || ''
      }));
      setActiveTab('book');
    }
  }, [location.state]);

  // Load appointments when switching to 'manage' tab
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/getall');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error connecting to backend server on port 5000.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. CREATE / BOOK APPOINTMENT (POST /create)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5001/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.acknowledged) {
        setMessage({
          type: 'success',
          text: `🎉 Appointment successfully booked for ${formData.name}! (Record ID: ${data.insertedId})`
        });
        // Reset form
        setFormData({
          name: '',
          age: '',
          contact: '',
          email: '',
          password: '',
          department: 'Cardiology & Vascular Care',
          doctor: 'Dr. Sarah Jenkins',
          disease: '',
          appointmentDate: '',
          appointmentTime: '10:00 AM'
        });
      } else {
        setMessage({ type: 'danger', text: data.msg || 'Could not complete booking.' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Server connection failed. Make sure your Node.js server is running on port 5000.' });
    }
  };

  // 2. LOGIN (POST /login)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();

      if (res.ok && data.jwtToken) {
        localStorage.setItem('mediconnect_token', data.jwtToken);
        setJwtToken(data.jwtToken);
        setCurrentUser(data.user);
        setMessage({ type: 'success', text: `Welcome back, ${data.user?.name || data.user?.email}! JWT token verified.` });
        setActiveTab('manage');
      } else {
        setMessage({ type: 'danger', text: data.msg || 'Invalid email or password' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Server error during login attempt.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mediconnect_token');
    setJwtToken('');
    setCurrentUser(null);
    setMessage({ type: 'info', text: 'You have logged out.' });
  };

  // 3. UPDATE STATUS (PUT /update/:id)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Appointment #${id} status changed to "${newStatus}".` });
        fetchAppointments();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to update appointment status.' });
    }
  };

  // 4. DELETE / CANCEL APPOINTMENT (DELETE /delete/:id)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and remove this appointment record?')) return;

    try {
      const res = await fetch(`http://localhost:5001/delete/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessage({ type: 'warning', text: `Appointment #${id} successfully cancelled and deleted.` });
        fetchAppointments();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to cancel appointment.' });
    }
  };

  return (
    <div>
      <div className="bg-light py-5 border-bottom">
        <div className="container text-center">
          <h1 className="font-weight-bold text-dark">Appointment & Clinical Portal</h1>
          <p className="lead text-muted max-w-700 mx-auto">
            Book a new medical visit, sign in, or manage your active hospital appointments.
          </p>

          {/* Navigation Tabs */}
          <div className="btn-group mt-3" role="group">
            <button
              type="button"
              className={`btn px-4 ${activeTab === 'book' ? 'btn-info' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('book')}
            >
              📝 Book Appointment
            </button>
            <button
              type="button"
              className={`btn px-4 ${activeTab === 'manage' ? 'btn-info' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('manage')}
            >
              📋 Manage Appointments (CRUD)
            </button>
            <button
              type="button"
              className={`btn px-4 ${activeTab === 'login' ? 'btn-info' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('login')}
            >
              🔐 {jwtToken ? 'Profile (Logged In)' : 'Portal Login (JWT)'}
            </button>
          </div>
        </div>
      </div>

      <div className="section-wrapper">
        {/* Status / Alert Message */}
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
            {message.text}
            <button type="button" className="close" onClick={() => setMessage({ type: '', text: '' })}>
              <span>&times;</span>
            </button>
          </div>
        )}

        {/* TAB 1: BOOK APPOINTMENT FORM (POST /create) */}
        {activeTab === 'book' && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="form-card">
                <div className="d-flex align-items-center mb-4">
                  <span style={{ fontSize: '2rem', marginRight: '12px' }}>🩺</span>
                  <div>
                    <h3 className="font-weight-bold text-dark mb-0">Book Doctor's Appointment</h3>
                    <small className="text-muted">Fill in patient details below to register into the hospital database.</small>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit}>
                  <div className="form-row">
                    <div className="form-group col-md-8">
                      <label className="font-weight-bold">Patient Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="e.g. Rahul Patil"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label className="font-weight-bold">Age *</label>
                      <input
                        type="number"
                        name="age"
                        className="form-control"
                        placeholder="e.g. 28"
                        required
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label className="font-weight-bold">Contact Number *</label>
                      <input
                        type="tel"
                        name="contact"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        required
                        value={formData.contact}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label className="font-weight-bold">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="patient@example.com"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="font-weight-bold">Patient Portal Password *</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter a secure password (stored using bcrypt encryption)"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <small className="form-text text-muted">
                      This password allows you to log in and view your medical appointments securely via JWT.
                    </small>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label className="font-weight-bold">Medical Department</label>
                      <select
                        name="department"
                        className="form-control"
                        value={formData.department}
                        onChange={handleInputChange}
                      >
                        <option value="Cardiology & Vascular Care">Cardiology & Vascular Care</option>
                        <option value="Orthopedics & Joint Care">Orthopedics & Joint Care</option>
                        <option value="Neurology & Neurosurgery">Neurology & Neurosurgery</option>
                        <option value="Pediatrics & Child Wellness">Pediatrics & Child Wellness</option>
                        <option value="General Medicine & Health Check">General Medicine & Health Check</option>
                        <option value="Dermatology & Cosmetology">Dermatology & Cosmetology</option>
                      </select>
                    </div>

                    <div className="form-group col-md-6">
                      <label className="font-weight-bold">Preferred Doctor</label>
                      <input
                        type="text"
                        name="doctor"
                        className="form-control"
                        placeholder="e.g. Dr. Sarah Jenkins"
                        value={formData.doctor}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label className="font-weight-bold">Appointment Date *</label>
                      <input
                        type="date"
                        name="appointmentDate"
                        className="form-control"
                        required
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label className="font-weight-bold">Preferred Time Slot *</label>
                      <select
                        name="appointmentTime"
                        className="form-control"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                      >
                        <option value="09:30 AM">09:30 AM (Morning)</option>
                        <option value="11:00 AM">11:00 AM (Morning)</option>
                        <option value="02:30 PM">02:30 PM (Afternoon)</option>
                        <option value="04:00 PM">04:00 PM (Evening)</option>
                        <option value="06:30 PM">06:30 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="font-weight-bold">Symptoms / Reason for Consultation</label>
                    <textarea
                      name="disease"
                      rows="3"
                      className="form-control"
                      placeholder="Briefly describe your symptoms or reason for visit (e.g., Chest pain, Knee stiffness, Routine checkup)..."
                      value={formData.disease}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary-custom btn-block btn-lg mt-4">
                    Confirm & Book Medical Appointment
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE APPOINTMENTS (FULL CRUD DASHBOARD) */}
        {activeTab === 'manage' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="font-weight-bold text-dark mb-0">Hospital Appointments Directory</h3>
                <small className="text-muted">Live records fetched from Express backend via MongoDB /getall endpoint</small>
              </div>
              <button onClick={fetchAppointments} className="btn btn-sm btn-outline-info">
                🔄 Refresh Records
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status"></div>
                <p className="mt-2 text-muted">Retrieving records from backend...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="card text-center p-5">
                <h4>No Appointments Found</h4>
                <p className="text-muted">Book your first appointment using the "Book Appointment" tab!</p>
                <div>
                  <button onClick={() => setActiveTab('book')} className="btn btn-primary-custom">
                    Book Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="appointment-table-container">
                <table className="table table-hover align-middle">
                  <thead className="thead-light">
                    <tr>
                      <th>Patient Name & Contact</th>
                      <th>Age</th>
                      <th>Dept & Doctor</th>
                      <th>Date & Slot</th>
                      <th>Symptoms / Condition</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="font-weight-bold text-dark">{item.name}</div>
                          <small className="text-muted">{item.email} | {item.contact}</small>
                        </td>
                        <td>{item.age} yrs</td>
                        <td>
                          <div className="font-weight-bold">{item.department || 'General OPD'}</div>
                          <small className="text-muted">{item.doctor}</small>
                        </td>
                        <td>
                          <div>{item.appointmentDate}</div>
                          <small className="text-info">{item.appointmentTime}</small>
                        </td>
                        <td>
                          <small className="text-secondary">{item.disease || 'General Checkup'}</small>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              item.status === 'Confirmed'
                                ? 'status-confirmed'
                                : item.status === 'Completed'
                                ? 'status-completed'
                                : item.status === 'Cancelled'
                                ? 'status-cancelled'
                                : 'status-scheduled'
                            }`}
                          >
                            {item.status || 'Scheduled'}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="btn-group btn-group-sm">
                            {item.status !== 'Confirmed' && item.status !== 'Completed' && (
                              <button
                                onClick={() => handleStatusUpdate(item._id, 'Confirmed')}
                                className="btn btn-outline-success"
                                title="Confirm Appointment"
                              >
                                ✓ Confirm
                              </button>
                            )}
                            {item.status === 'Confirmed' && (
                              <button
                                onClick={() => handleStatusUpdate(item._id, 'Completed')}
                                className="btn btn-outline-secondary"
                                title="Mark as Completed"
                              >
                                🏁 Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="btn btn-outline-danger"
                              title="Delete Appointment"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOGIN / JWT AUTHENTICATION */}
        {activeTab === 'login' && (
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="form-card">
                {jwtToken ? (
                  <div className="text-center py-4">
                    <span style={{ fontSize: '3rem' }}>✅</span>
                    <h4 className="font-weight-bold text-success mt-2">Authenticated via JWT Token</h4>
                    <p className="text-muted small">
                      You are securely logged into MediConnect with an active JSON Web Token.
                    </p>
                    <div className="p-3 bg-light rounded text-left mb-3">
                      <small className="text-uppercase font-weight-bold text-muted">Active JWT Token (Truncated):</small>
                      <div className="text-monospace text-truncate font-weight-bold text-dark">
                        {jwtToken}
                      </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline-danger">
                      Log Out
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-weight-bold text-dark mb-2">Patient / Staff Login</h3>
                    <p className="text-muted small mb-4">
                      Authenticate with your email and password to receive a signed JWT token from the Express server.
                    </p>

                    <form onSubmit={handleLoginSubmit}>
                      <div className="form-group">
                        <label className="font-weight-bold">Registered Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="e.g. arjun.verma@example.com"
                          required
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="font-weight-bold">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter your password"
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary-custom btn-block mt-4">
                        Sign In & Verify JWT
                      </button>
                    </form>

                    <div className="alert alert-info mt-4 small mb-0">
                      💡 <strong>Demo Credentials:</strong> Try <code>arjun.verma@example.com</code> with password <code>admin123</code>, or register a new patient in the "Book Appointment" tab!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
