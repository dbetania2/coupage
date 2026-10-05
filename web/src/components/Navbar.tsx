import React from 'react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <a href="#" className="nav-link active">VINOS</a>
        <a href="#" className="nav-link">DELICATESSEN</a>
        <a href="#" className="nav-link">CAJAS DE REGALO</a>
        <a href="#" className="nav-link">ATELIER</a>
      </div>
      
      <div className="nav-center">
        <a href="/" className="nav-logo">TU GUSTO GOURMET</a>
      </div>
      
      <div className="nav-right">
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Buscar..." className="search-input" />
        </div>
        
        <div className="nav-icons">
          <a href="#" className="icon-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </a>
          <a href="#" className="icon-link cart-icon-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="cart-badge">2</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
