import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h1 className="hero-title">
          Shape Their Future with <span className="highlight">Confidence</span>
        </h1>
        <p className="hero-subtitle">
          Premium study abroad programs designed for early childhood and youth. 
          Experience a safe, nurturing, and world-class educational environment.
        </p>
        <div className="hero-actions">
          <a href="#booking" className="btn btn-primary btn-large">Book a Consultation</a>
          <a href="#programs" className="btn btn-secondary btn-large">Explore Programs</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
