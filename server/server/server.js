const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bodyparser = require("body-parser");
const bCrypt = require("bcrypt");
const jwtToken = require("jsonwebtoken");
const cors = require("cors");

// Load .env if present
try {
  process.loadEnvFile();
} catch (e) {
  // No .env file found; using default config
}

const app = express();
app.use(cors());
app.use(bodyparser.json());

let uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const port = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "MEDICONNECT_SECRET_KEY_2026";

let client;
let myDb;
let embeddedMongoServer = null;

// Initial seed records
const initialPatients = [
  {
    name: "Arjun Verma",
    age: 28,
    contact: "+91 98765 43210",
    email: "arjun.verma@example.com",
    role: "Patient",
    department: "Cardiology & Vascular Care",
    doctor: "Dr. Sarah Jenkins (Cardiologist)",
    disease: "Routine ECG & Blood Pressure Check",
    appointmentDate: "2026-10-30",
    appointmentTime: "10:30 AM",
    status: "Confirmed",
    progress: "Treatment Ongoing",
    progressNotes: "ECG completed. Mild sinus tachycardia observed. Vitals stabilized. Next clinical review on Friday.",
    prescriptions: "Metoprolol 25mg (1x daily post breakfast), Aspirin 75mg",
    createdAt: new Date()
  },
  {
    name: "Pooja Sharma",
    age: 34,
    contact: "+91 91234 56789",
    email: "pooja.sharma@example.com",
    role: "Patient",
    department: "Orthopedics & Joint Care",
    doctor: "Dr. Rajesh Kulkarni (Orthopedic Surgeon)",
    disease: "Persistent Knee Joint Pain",
    appointmentDate: "2026-11-02",
    appointmentTime: "02:15 PM",
    status: "Scheduled",
    progress: "Under Observation",
    progressNotes: "Left knee X-ray scheduled for morning slot. Physiotherapy session recommended.",
    prescriptions: "Aceclofenac + Paracetamol SOS, Joint flex cream",
    createdAt: new Date()
  },
  {
    name: "Rohan Nair",
    age: 45,
    contact: "+91 99887 76655",
    email: "rohan.nair@example.com",
    role: "Patient",
    department: "Neurology & Neurosurgery",
    doctor: "Dr. Elena Rostova (Neurologist)",
    disease: "Recurring Migraines & Vertigo",
    appointmentDate: "2026-11-05",
    appointmentTime: "11:00 AM",
    status: "Completed",
    progress: "Discharged & Stable",
    progressNotes: "Brain MRI normal. Chronic tension headache controlled with lifestyle advice and medication.",
    prescriptions: "Flunarizine 10mg nocte for 14 days, Vitamin B2 supplements",
    createdAt: new Date()
  }
];

async function seedDatabaseIfEmpty() {
  try {
    const count = await myDb.collection("patient").countDocuments();
    if (count === 0) {
      console.log("Seeding initial patient records into MongoDB...");
      const defaultHashedPass = await bCrypt.hash("admin123", 10);
      const recordsToInsert = initialPatients.map((p) => ({
        ...p,
        password: defaultHashedPass
      }));
      await myDb.collection("patient").insertMany(recordsToInsert);
      console.log(`Seeded ${recordsToInsert.length} patient records successfully!`);
    }
  } catch (err) {
    console.error("Notice during seeding:", err.message);
  }
}

async function connectToMongoDb() {
  let isConnected = false;

  // 1. First attempt: connect to specified URI (e.g., local 127.0.0.1:27017 or Atlas)
  try {
    console.log(`Attempting connection to MongoDB at: ${uri}`);
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
    await client.connect();
    isConnected = true;
    console.log("Connected to external/system MongoDB successfully!");
  } catch (err) {
    console.log(`No active MongoDB on ${uri}. Auto-starting local MongoDB instance on 127.0.0.1:27017...`);

    // 2. Fallback: Automatically spin up official MongoDB server on 127.0.0.1:27017
    try {
      embeddedMongoServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          ip: "127.0.0.1",
          dbName: "mediconnectDb"
        }
      });
      uri = embeddedMongoServer.getUri();
      client = new MongoClient(uri);
      await client.connect();
      isConnected = true;
      console.log("SUCCESS: Real MongoDB instance is now running on 127.0.0.1:27017!");
    } catch (embedErr) {
      console.error("Failed to launch embedded MongoDB:", embedErr.message);
    }
  }

  if (isConnected) {
    myDb = client.db("mediconnectDb");
    await seedDatabaseIfEmpty();

    console.log("==================================================================");
    console.log("🍃 MONGODB DATABASE CONNECTED & READY!");
    console.log("👉 Connection URL: mongodb://127.0.0.1:27017");
    console.log("👉 Database:       mediconnectDb");
    console.log("👉 Collection:     patient");
    console.log("👉 MongoDB Compass: Open Compass -> Paste 'mongodb://127.0.0.1:27017' -> Click Connect!");
    console.log("==================================================================");

    app.listen(port, () => {
      console.log(`🚀 MediConnect Server running at: http://localhost:${port}`);
    });
  } else {
    console.error("Fatal: Could not start MongoDB.");
  }
}

connectToMongoDb();

// Root route with helpful links
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MediConnect Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 60px 20px; background: #f8fafc; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          h1 { color: #0f766e; margin-bottom: 10px; }
          .status { display: inline-block; background: #dcfce7; color: #166534; font-weight: bold; padding: 6px 16px; border-radius: 20px; margin: 15px 0; }
          .btn { display: inline-block; background: #0d9488; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; margin-top: 15px; }
          .btn:hover { background: #0f766e; }
          .endpoints { text-align: left; background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 25px; font-size: 0.9rem; }
          code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0369a1; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🏥 MediConnect Backend API</h1>
          <div class="status">● Server is Active on Port 5001</div>
          <p>This is the <strong>Node.js + Express + MongoDB</strong> backend server.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p><strong>To view and use the website, open your React Frontend:</strong></p>
          <a class="btn" href="http://localhost:5173" target="_blank">👉 Open React Website (localhost:5173)</a>
          <div class="endpoints">
            <strong>Active REST Endpoints:</strong>
            <ul style="margin: 8px 0 0 20px; padding: 0;">
              <li><code>GET /getall</code> – Fetch all patient records from MongoDB</li>
              <li><code>POST /create</code> – Register patient & book appointment</li>
              <li><code>POST /login</code> – Authenticate patient or Administrator with JWT</li>
              <li><code>GET /me</code> – Verify current JWT session</li>
              <li><code>PUT /update/:id</code> – Update appointment & clinical progress</li>
              <li><code>DELETE /delete/:id</code> – Remove appointment</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// 1. GET ALL PATIENTS / APPOINTMENTS (GET /getall)
app.get("/getall", async (req, res) => {
  try {
    const data = await myDb.collection("patient").find().toArray();
    res.send(data);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 2. GET SINGLE PATIENT BY ID (GET /get/:id)
app.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const patient = await myDb.collection("patient").findOne({ _id: new ObjectId(id) });
    if (patient) {
      res.send(patient);
    } else {
      res.status(404).send({ msg: "Patient record not found in MongoDB" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 3. CREATE / REGISTER NEW PATIENT & BOOK APPOINTMENT (POST /create)
app.post("/create", async (req, res) => {
  const { name, age, contact, disease, email, password, department, doctor, appointmentDate, appointmentTime, status, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).send({ msg: "Name, email, and password are required" });
  }

  try {
    const hashedPass = await bCrypt.hash(password, 10);
    const newRecord = {
      name,
      age: Number(age) || 0,
      contact: contact || "Not Provided",
      email,
      password: hashedPass,
      department: department || "General Medicine & Health Check",
      doctor: doctor || "On-Call Medical Officer",
      disease: disease || "General Consultation",
      appointmentDate: appointmentDate || new Date().toISOString().split("T")[0],
      appointmentTime: appointmentTime || "10:00 AM",
      status: status || "Scheduled",
      role: role || "Patient",
      progress: "Under Observation",
      progressNotes: "Initial registration recorded in MongoDB. Awaiting doctor's clinical review.",
      prescriptions: "No prescription issued yet.",
      createdAt: new Date()
    };

    const response = await myDb.collection("patient").insertOne(newRecord);
    res.send({ acknowledged: true, insertedId: response.insertedId, record: newRecord });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 4. LOGIN & GENERATE JWT TOKEN (POST /login)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Built-in Administrator credential
    if (email === "admin@mediconnect.health" && password === "admin123") {
      const payLoad = {
        subject: "Hospital Chief Administrator",
        role: "Administrator",
        email: "admin@mediconnect.health"
      };

      const token = jwtToken.sign(payLoad, JWT_SECRET, { expiresIn: "12h" });
      return res.send({
        msg: "Administrator login successful",
        jwtToken: token,
        user: {
          name: "Hospital Chief Administrator",
          email: "admin@mediconnect.health",
          role: "Administrator"
        }
      });
    }

    const patient = await myDb.collection("patient").findOne({ email: email });

    if (patient != null) {
      const isCorrect = await bCrypt.compare(password, patient.password);

      if (isCorrect) {
        const payLoad = {
          subject: patient.name,
          role: patient.role || "Patient",
          email: patient.email
        };

        const token = jwtToken.sign(payLoad, JWT_SECRET, { expiresIn: "12h" });
        res.send({
          msg: "Login successful",
          jwtToken: token,
          user: {
            id: patient._id,
            name: patient.name,
            email: patient.email,
            role: patient.role || "Patient",
            department: patient.department,
            progress: patient.progress || "Under Observation",
            progressNotes: patient.progressNotes || "Routine checkup and clinical observation underway.",
            prescriptions: patient.prescriptions || "Standard care & hydration advice."
          }
        });
      } else {
        res.status(401).send({ msg: "Incorrect Password. Please try again." });
      }
    } else {
      res.status(422).send({ msg: "Invalid Email: Account not found in MongoDB database" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 5. VERIFY CURRENT USER SESSION (GET /me)
app.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ msg: "No authorization token provided" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwtToken.verify(token, JWT_SECRET);
    res.send({ user: decoded });
  } catch (err) {
    res.status(401).send({ msg: "Invalid or expired JWT token" });
  }
});

// 6. UPDATE APPOINTMENT STATUS & CLINICAL PROGRESS (PUT /update/:id)
app.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { status, appointmentDate, appointmentTime, doctor, progress, progressNotes, prescriptions, doctorNotes, department } = req.body;

  try {
    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (progress !== undefined) updateFields.progress = progress;
    if (progressNotes !== undefined) updateFields.progressNotes = progressNotes;
    if (prescriptions !== undefined) updateFields.prescriptions = prescriptions;
    if (doctorNotes !== undefined) updateFields.doctorNotes = doctorNotes;
    if (appointmentDate !== undefined) updateFields.appointmentDate = appointmentDate;
    if (appointmentTime !== undefined) updateFields.appointmentTime = appointmentTime;
    if (doctor !== undefined) updateFields.doctor = doctor;
    if (department !== undefined) updateFields.department = department;
    updateFields.updatedAt = new Date();

    const response = await myDb.collection("patient").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    res.send({ acknowledged: true, modifiedCount: response.modifiedCount, updatedFields });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 7. DELETE / CANCEL APPOINTMENT (DELETE /delete/:id)
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const response = await myDb.collection("patient").deleteOne({ _id: new ObjectId(id) });
    res.send(response);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Graceful cleanup on shutdown
process.on("SIGINT", async () => {
  if (embeddedMongoServer) await embeddedMongoServer.stop();
  process.exit(0);
});
