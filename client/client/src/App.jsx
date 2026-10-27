import { Routes, Route } from 'react-router-dom';
import Nav from './nav';
import Home from './home';
import About from './about';
import Services from './services';
import Contact from './contact';
import Login from './login';
import './App.css';

const App = () => {
  return (
    <div className="app-container">
      <Nav />
      <main className="content-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
