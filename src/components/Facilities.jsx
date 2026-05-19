import React from 'react';
import './Facilities.css';

const Facilities = () => {
  const facilitiesData = [
    {
      id: 1,
      title: 'Modern Classrooms',
      image: '/facility_classroom.png',
      description: 'Bright and engaging learning spaces.'
    },
    {
      id: 2,
      title: 'Safe Playground',
      image: '/facility_playground.png',
      description: 'Outdoor areas designed for active play and safety.'
    },
    {
      id: 3,
      title: 'Nutritious Cafeteria',
      image: '/facility_cafeteria.png',
      description: 'Healthy meals in a clean, modern dining hall.'
    }
  ];

  return (
    <section id="facilities" className="section facilities-section">
      <div className="container">
        <h2 className="section-title">World-Class Environment</h2>
        <p className="section-subtitle">
          Explore our state-of-the-art campus, designed specifically for the safety, comfort, and growth of young learners.
        </p>

        <div className="facilities-grid">
          {facilitiesData.map((facility) => (
            <div key={facility.id} className="facility-card">
              <div className="facility-image-wrapper">
                {/* Fallback background color if image fails to load */}
                <div 
                  className="facility-image" 
                  style={{ backgroundImage: `url(${facility.image}), linear-gradient(var(--primary-beige), var(--primary-beige))` }}
                ></div>
                <div className="facility-overlay">
                  <h3 className="facility-title">{facility.title}</h3>
                  <p className="facility-desc">{facility.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;
