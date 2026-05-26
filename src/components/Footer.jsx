import React from 'react';
import './Footer.css';
import { MapPin, Phone, Mail, Share2, Globe } from 'lucide-react';
import LogoIcon from './LogoIcon';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo footer-logo">
              <LogoIcon size={32} style={{ marginRight: '4px' }} />
              <span className="logo-text">Vibe Education</span>
            </div>
            <p className="footer-desc">
              Empowering the next generation with premium study abroad experiences, combining academic excellence with holistic care.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><Share2 size={20} /></a>
              <a href="#" className="social-link"><Globe size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#facilities">Facilities</a></li>
              <li><a href="#programs">Programs</a></li>
              <li><a href="#packages">Pricing Packages</a></li>
              <li><a href="#booking">Book Consultation</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li>
                <MapPin size={18} />
                <span>123 Global Edu Lane, Prestige District, City</span>
              </li>
              <li>
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <Mail size={18} />
                <span>admissions@vibeeducation.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Vibe Education. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
