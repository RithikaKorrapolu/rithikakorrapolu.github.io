import React from 'react';

export const MusicCard = ({ title, artist, image }) => (
  <div className="likes-card">
    <span className="category-label">Music</span>
    <div className="card-content">
      <img 
        src={image} 
        alt={`${title} by ${artist}`} 
        className="likes-image"
      />
      <div className="card-info">
        <h3>{title}</h3>
        <p>By {artist}</p>
      </div>
      <div className="music-controls">
        <button><img src="/icons/shuffle.svg" alt="shuffle" /></button>
        <button><img src="/icons/prev.svg" alt="previous" /></button>
        <button><img src="/icons/play.svg" alt="play" /></button>
        <button><img src="/icons/next.svg" alt="next" /></button>
        <button><img src="/icons/volume.svg" alt="volume" /></button>
      </div>
    </div>
  </div>
);

export const QuoteCard = ({ text, author }) => (
  <div className="likes-card">
    <span className="category-label">Quotes</span>
    <div className="card-content quote">
      <p>"{text}"</p>
      <p className="author">-{author}</p>
    </div>
  </div>
);

export const FilmCard = ({ title, image }) => (
  <div className="likes-card">
    <span className="category-label">Film + TV</span>
    <div className="card-content">
      <img 
        src={image} 
        alt={title} 
        className="likes-image"
      />
      <h3>{title}</h3>
    </div>
  </div>
);

export const ArtCard = ({ title, artist, image }) => (
  <div className="likes-card">
    <span className="category-label">Fine Art</span>
    <div className="card-content">
      <img 
        src={image} 
        alt={`${title} by ${artist}`} 
        className="likes-image"
      />
    </div>
  </div>
);

export const RandomCard = ({ title }) => (
  <div className="likes-card">
    <span className="category-label">Specific Random Things</span>
    <div className="card-content">
      <p>{title}</p>
    </div>
  </div>
);

export const WritingCard = ({ title, image }) => (
  <div className="likes-card">
    <span className="category-label">Writing</span>
    <div className="card-content">
      <img 
        src={image} 
        alt={title} 
        className="likes-image"
      />
    </div>
  </div>
);