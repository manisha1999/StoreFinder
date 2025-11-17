import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../NavBar/NavBar';
import Footer from '../Footer/Footer';
import './Layout.css';

const Layout: React.FC = () => {
  return (
    <div className="layout-root">
      <Navbar />
      <div className="layout-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
