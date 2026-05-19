import React, { useState } from 'react';
import './Programs.css';
import { BookOpen, Clock, Users } from 'lucide-react';

const Programs = () => {
  const [activeTab, setActiveTab] = useState('kindergarten');

  const programsData = {
    kindergarten: {
      title: 'Kindergarten Program',
      age: 'Ages 4-6',
      description: 'A play-based learning environment focusing on social skills, basic phonics, and creative expression.',
      schedule: '09:00 AM - 03:00 PM',
      highlights: ['Bilingual Immersion', 'Creative Arts', 'Outdoor Discovery']
    },
    elementary: {
      title: 'Elementary Program',
      age: 'Ages 7-11',
      description: 'Building a strong academic foundation with inquiry-based learning in STEM, humanities, and languages.',
      schedule: '08:30 AM - 03:30 PM',
      highlights: ['STEM Projects', 'Global Perspectives', 'Sports & Clubs']
    },
    middle: {
      title: 'Middle School Program',
      age: 'Ages 12-14',
      description: 'Preparing students for high school with rigorous academics, leadership training, and personal development.',
      schedule: '08:00 AM - 04:00 PM',
      highlights: ['Advanced Academics', 'Leadership Training', 'Career Exploration']
    }
  };

  const currentProgram = programsData[activeTab];

  return (
    <section id="programs" className="section programs-section">
      <div className="container">
        <h2 className="section-title">Curriculum & Activities</h2>
        <p className="section-subtitle">
          Tailored educational journeys for every stage of development, ensuring academic excellence and personal growth.
        </p>

        <div className="programs-tabs">
          <button 
            className={`tab-btn ${activeTab === 'kindergarten' ? 'active' : ''}`}
            onClick={() => setActiveTab('kindergarten')}
          >
            Kindergarten
          </button>
          <button 
            className={`tab-btn ${activeTab === 'elementary' ? 'active' : ''}`}
            onClick={() => setActiveTab('elementary')}
          >
            Elementary
          </button>
          <button 
            className={`tab-btn ${activeTab === 'middle' ? 'active' : ''}`}
            onClick={() => setActiveTab('middle')}
          >
            Middle School
          </button>
        </div>

        <div className="program-content">
          <div className="program-header">
            <h3>{currentProgram.title}</h3>
            <span className="age-badge">{currentProgram.age}</span>
          </div>
          
          <p className="program-desc">{currentProgram.description}</p>
          
          <div className="program-details">
            <div className="detail-item">
              <Clock size={20} color="var(--primary-blue)" />
              <span>{currentProgram.schedule}</span>
            </div>
            <div className="detail-item">
              <Users size={20} color="var(--primary-blue)" />
              <span>Small Class Sizes (Max 15)</span>
            </div>
          </div>

          <div className="program-highlights">
            <h4>Key Highlights</h4>
            <ul>
              {currentProgram.highlights.map((highlight, index) => (
                <li key={index}>
                  <BookOpen size={16} color="var(--primary-blue)" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs;
