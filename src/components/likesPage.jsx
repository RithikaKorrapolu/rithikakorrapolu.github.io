import React, { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';
import {
  MusicCard,
  QuoteCard,
  FilmCard,
  ArtCard,
  RandomCard,
  WritingCard
} from './cardComponents';
import { likesData, CATEGORY_THEMES, getAllItems, shuffleItems } from '../../data/likesData';

const LikesPage = () => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const allItems = getAllItems();
    setItems(allItems);
  }, []);

  const handleShuffle = () => {
    setItems(shuffleItems(items));
  };

  const handleFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleShuffle();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [items]);

  const filteredItems = selectedCategory
    ? items.filter(item => item.type === selectedCategory)
    : items;

  return (
    <div className="content-container">
      <div className="likes-content">
        <div className="likes-header">
          <h1>Things I Like</h1>
          <p className="likes-quote">
            "It should be enough. To make something beautiful should be enough. It isn't. It should be."
            <br />-Richard Silken
          </p>
          
          <div className="likes-controls">
            <button 
              onClick={handleShuffle}
              className="shuffle-button"
            >
              <Shuffle />
              Hit spacebar to shuffle and see more
            </button>
            
            <div className="categories">
              {Object.entries(CATEGORY_THEMES).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => handleFilter(key)}
                  className={`category-button ${selectedCategory === key ? 'active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="likes-grid">
          {filteredItems.map(item => {
            switch (item.type) {
              case 'music':
                return <MusicCard key={item.id} {...item} />;
              case 'quote':
                return <QuoteCard key={item.id} {...item} />;
              case 'film':
                return <FilmCard key={item.id} {...item} />;
              case 'art':
                return <ArtCard key={item.id} {...item} />;
              case 'random':
                return <RandomCard key={item.id} {...item} />;
              case 'writing':
                return <WritingCard key={item.id} {...item} />;
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default LikesPage;