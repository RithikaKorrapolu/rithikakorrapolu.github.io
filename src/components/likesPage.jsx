import React, { useState } from 'react';
import { Shuffle, Filter } from 'lucide-react';
import { likesData } from '../../data/likesData.js'; // Adjust path if needed

const LikesPage = () => {
  // Combine all categories into a single list
  const [items, setItems] = useState([...likesData.music, ...likesData.quotes]);

  return (
    <div className="likes-container">
      <div className="likes-content">
        <div className="likes-header">
          <h1>Things I Like</h1>
          <p className="likes-quote">
            "It should be enough. To make something beautiful should be enough. It isn't. It should be."
            <br />- Richard Silken
          </p>
          
          <div className="likes-controls">
            <button className="shuffle-button">
              <Shuffle size={24} />
              <span>Hit spacebar to shuffle and see more</span>
            </button>
            <button className="filter-button">
              <Filter size={24} />
            </button>
          </div>
        </div>
        
        {/* Render grid items */}
        <div className="likes-grid">
          {items.map((item) => (
            <div key={item.id} className="likes-card">
              {item.type === 'music' ? (
                <>
                  <img src={item.image} alt={item.title} className="likes-image" />
                  <h3>{item.title}</h3>
                  <p>{item.artist}</p>
                </>
              ) : (
                <>
                  <p className="quote-text">"{item.text}"</p>
                  <p className="quote-author">- {item.author}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LikesPage;
