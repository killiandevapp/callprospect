

import React from "react";
import gitIcon from "../assets/git.png"; // importe ton image
import  "../style/header.css";


export default function Header() {
  return (
    <header className="header">
      <img src={gitIcon} alt="Git Logo" />
      <div className="container nav">
        <div className="logo">
          <div className="logo-circle">
            <svg className="logo" viewBox="0 0 64 64" aria-label="Logo CodeNova" role="img">
              <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00c9ff" />
                  <stop offset="100%" stopColor="#005fff" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="28" fill="none" stroke="url(#g)" strokeWidth="4" />
              <path d="M26 38l-8-6 8-6" fill="none" stroke="url(#g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M38 26l8 6-8 6" fill="none" stroke="url(#g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span>
            kiv<span className="text-primary">Ency</span>
          </span>
        </div>

        <nav>
          <a href="/app">Apelle</a>
          <a href="/stats">Statistiques</a>
          <a href="/history">Historique</a>
                    <a href="/meeting">Rdv</a>
   
        </nav>
      </div>
    </header>
  );
}
