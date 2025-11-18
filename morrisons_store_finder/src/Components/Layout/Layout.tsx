// ...existing code...
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../NavBar/NavBar';
import Footer from '../Footer/Footer';
import logo from '../../assests/morrisonsLogo.png';
import './Layout.css';

const Layout: React.FC = () => {
  return (
    <div className="app-layout">
      <header className="site-header" role="banner">
        <div className="header-inner">
          <img src={logo} alt="Morrisons" className="site-logo" />
          <div className="header-nav">
            <Navbar />
          </div>
        </div>
      </header>

      <main className="app-main" role="main">
        <div className="page-container">
          <Outlet />
        </div>
      </main>

      <footer className="site-footer" role="contentinfo">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
// ...existing code...