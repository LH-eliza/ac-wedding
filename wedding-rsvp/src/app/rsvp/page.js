// src/app/rsvp/page.js
"use client"
import { useState } from 'react';

export default function Rsvp() {
  const [name, setName] = useState('');
  const [meal, setMeal] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, meal }),
    });

    const data = await response.json();
    if (data.message === 'RSVP submitted successfully') {
      setIsSubmitted(true);
    } else {
        console.error('Error submitting RSVP:', data.error);
      alert("failed");
    }
  };

  return (
    <div>
      <h1>Wedding RSVP</h1>
      {isSubmitted ? (
        <div>Thank you for your RSVP, {name}!</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Full Name:</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label htmlFor="meal">Meal Preference:</label>
            <select 
              id="meal" 
              value={meal} 
              onChange={(e) => setMeal(e.target.value)} 
              required
            >
              <option value="">Select...</option>
              <option value="Chicken">Chicken</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>
          <button type="submit">Submit RSVP</button>
        </form>
      )}
    </div>
  );
}
