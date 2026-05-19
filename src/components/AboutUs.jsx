import React from 'react';
import './AboutUs.css';
import { Award, Heart, ShieldCheck } from 'lucide-react';

const AboutUs = () => {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-image-wrapper">
            {/* Using a placeholder div for director photo */}
            <div className="director-photo">
              <span className="photo-placeholder-text">Director Photo</span>
            </div>
            <div className="experience-badge">
              <span className="years">15+</span>
              <span className="text">Years of Excellence</span>
            </div>
          </div>
          <div className="about-content">
            <h2 className="section-title" style={{ textAlign: 'left' }}>A Foundation of Trust and Excellence</h2>
            <p className="about-description">
              At Vibe Education, we believe that every child deserves a safe, nurturing, and globally-minded environment to thrive. Our tailored study abroad programs for kindergarten to middle school students focus on holistic development, combining world-class academics with comprehensive care.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <ShieldCheck size={24} color="var(--primary-blue)" />
                </div>
                <div>
                  <h3 className="feature-title">Uncompromising Safety</h3>
                  <p className="feature-text">24/7 dedicated care staff and fully secured campus facilities for complete peace of mind.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Award size={24} color="var(--primary-blue)" />
                </div>
                <div>
                  <h3 className="feature-title">Proven Excellence</h3>
                  <p className="feature-text">Over a decade of experience placing students in top-tier educational institutions globally.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Heart size={24} color="var(--primary-blue)" />
                </div>
                <div>
                  <h3 className="feature-title">Holistic Care</h3>
                  <p className="feature-text">Emotional, physical, and academic support tailored to early childhood and youth needs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
