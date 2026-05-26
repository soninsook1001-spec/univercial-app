import React from 'react';
import './App.css';
import { Phone, Calendar } from 'lucide-react';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Facilities from './components/Facilities';
import Programs from './components/Programs';
import Packages from './components/Packages';
import Booking from './components/Booking';
import Footer from './components/Footer';
import LogoIcon from './components/LogoIcon';

function App() {
  return (
    <div className="app-container">
      {/* Navigation */}
      <header className="navbar">
        <div className="container nav-container">
          <div className="logo">
            <LogoIcon size={32} style={{ marginRight: '4px' }} />
            <span className="logo-text">Vibe Education</span>
          </div>
          <nav className="nav-links">
            <a href="#about">About Us</a>
            <a href="#facilities">Facilities</a>
            <a href="#programs">Programs</a>
            <a href="#packages">Packages</a>
          </nav>
          <div className="nav-actions">
            <a href="#booking" className="btn btn-primary">Book Consultation</a>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <AboutUs />
        <Facilities />
        <Programs />
        <Packages />
        <Booking />
      </main>

      <Footer />
    </div>
  );
}

export default App;
