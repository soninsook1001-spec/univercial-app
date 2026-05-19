import React from 'react';
import './Packages.css';
import { Check } from 'lucide-react';

const Packages = () => {
  const packages = [
    {
      id: 1,
      name: 'Standard Care',
      price: '$2,500',
      period: 'per semester',
      description: 'Ideal for students needing basic academic and emotional support.',
      features: [
        'Full Tuition Coverage',
        'Standard Housing',
        '24/7 Security',
        'Basic Health Insurance'
      ],
      isPopular: false
    },
    {
      id: 2,
      name: 'Premium Care',
      price: '$3,800',
      period: 'per semester',
      description: 'Comprehensive support including extracurriculars and premium housing.',
      features: [
        'Full Tuition Coverage',
        'Premium Single Room Housing',
        'Dedicated Caretaker (1:5 ratio)',
        'Extracurricular Activities',
        'Premium Health Insurance',
        'Weekend Excursions'
      ],
      isPopular: true
    },
    {
      id: 3,
      name: 'Elite Guardian',
      price: '$5,500',
      period: 'per semester',
      description: 'The ultimate all-inclusive package with personalized 1:1 mentorship.',
      features: [
        'Full Tuition Coverage',
        'Luxury En-suite Housing',
        'Personal 1:1 Mentor',
        'Unlimited Extracurriculars',
        'Global VIP Health Insurance',
        'Weekly Progress Reports',
        'Private Tutoring Sessions'
      ],
      isPopular: false
    }
  ];

  return (
    <section id="packages" className="section packages-section">
      <div className="container">
        <h2 className="section-title">Our Packages</h2>
        <p className="section-subtitle">
          Transparent, all-inclusive packages designed to provide the best care and education for your child.
        </p>

        <div className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`package-card ${pkg.isPopular ? 'popular' : ''}`}>
              {pkg.isPopular && <div className="popular-badge">Most Popular</div>}
              
              <div className="package-header">
                <h3 className="package-name">{pkg.name}</h3>
                <div className="package-price">
                  <span className="amount">{pkg.price}</span>
                  <span className="period">{pkg.period}</span>
                </div>
                <p className="package-desc">{pkg.description}</p>
              </div>

              <div className="package-features">
                <ul>
                  {pkg.features.map((feature, idx) => (
                    <li key={idx}>
                      <div className="check-icon">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="package-action">
                <a href="#booking" className={`btn ${pkg.isPopular ? 'btn-primary' : 'btn-secondary'} w-100`}>
                  Select Package
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Packages;
