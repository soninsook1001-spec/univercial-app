import React, { useState } from 'react';
import './Booking.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Phone, Baby } from 'lucide-react';

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState(15);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleBooking = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000); // Reset after 3 seconds
  };

  // Simple mock calendar data
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <section id="booking" className="section booking-section">
      <div className="container">
        <div className="booking-wrapper">
          <div className="booking-info">
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '16px' }}>Book Your Consultation</h2>
            <p className="booking-desc">
              Schedule a personalized consultation with our education experts. Select a date that works for you, and we'll be in touch to confirm the time.
            </p>

            <div className="calendar-widget">
              <div className="calendar-header">
                <button className="calendar-nav"><ChevronLeft size={20} /></button>
                <span className="calendar-month">May 2026</span>
                <button className="calendar-nav"><ChevronRight size={20} /></button>
              </div>
              <div className="calendar-grid">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="calendar-day-name">{day}</div>
                ))}
                {/* Empty slots for start of month */}
                <div className="calendar-day empty"></div>
                <div className="calendar-day empty"></div>
                {daysInMonth.map(day => (
                  <button 
                    key={day} 
                    className={`calendar-day ${selectedDate === day ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="booking-form-wrapper">
            <div className="form-card">
              <h3>Parent & Student Details</h3>
              {isSubmitted ? (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h4>Booking Confirmed!</h4>
                  <p>Your consultation is scheduled. We look forward to meeting you.</p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="booking-form">
                  <div className="form-group">
                    <label>Parent's Name</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input type="text" placeholder="e.g. Jane Doe" required />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input type="tel" placeholder="e.g. (555) 123-4567" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Child's Age / Grade</label>
                    <div className="input-with-icon">
                      <Baby size={18} className="input-icon" />
                      <input type="text" placeholder="e.g. 8 years old, 3rd Grade" required />
                    </div>
                  </div>

                  <div className="payment-summary">
                    <div className="summary-row">
                      <span>Consultation Deposit</span>
                      <span>$50.00</span>
                    </div>
                    <p className="summary-note">Deposit is fully refundable upon attendance.</p>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 submit-btn">
                    Pay $50 & Book
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Booking;
