/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable import/no-unresolved */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable import/extensions */
/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import axios from 'axios';

// const Nav = ({ user, onClick, logout }) => (
//   <div onClick={(e) => {
//     if (e.target.className === 'views') {
//       onClick(e.target.value);
//     }
//   }}
//   >
//     <h1>{`Hello ${user.name}`}</h1>
//     <button value="home" className="views">
//       Home
//     </button>
//     <button value="sub" className="views">
//       list of subs
//     </button>
//     <button value="post" className="views">
//       post
//     </button>
//     <button value="notifs" className="views">
//       notifs
//     </button>
//     <button value="DMs" className="views">
//       DMs
//     </button>
//     <input />
//     <button onClick={logout}>logout</button>
//   </div>
// );
import { FaHome, FaStar, FaPen, FaBell, FaEnvelope, FaSearch, FaDoorOpen } from 'react-icons/fa';
import HomePage from './HomePage/HomePage.jsx';
import DMs from './dms.jsx';
import Notifs from './notifs.jsx';
import logo from './HomePage/img/logo.jpg';

const Nav = ({ user, onClick, logout }) => (
  <div onClick={(e) => {
    if (e.target.className === 'views') {
      onClick(e.target.value);
    }
  }}
  >
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200&display=swap" rel="stylesheet" />
    <img
      id="homeButton"
      src={logo}
      alt="logo"
    // onClick={() => { console.log('hey'); setPage('home'); }}
    />
    <ul className="navbar">
      <li onClick={() => onClick('home')} className="views" title="home feed">
        {' '}
        <FaHome />
        {' '}
      </li>
      <li onClick={() => onClick('sub')} className="views" title="subscriptions">
        {' '}
        <FaStar />
      </li>
      <li onClick={() => onClick('post')} className="views" title="create a post">
        {' '}
        <FaPen />
        {' '}
      </li>
      <li onClick={() => onClick('notifs')} className="views" title="notifications">
        <FaBell />
        {' '}
      </li>
      <li onClick={() => onClick('DMs')} className="views" title="messages">
        <FaEnvelope />
        {' '}
      </li>
      <li onClick={logout} title="log out" onClick={() => axios.get('/logout')}><FaDoorOpen /></li>
      <li>
        {' '}
        <div className="wrap">
          <div className="search">
            <input type="text" className="search-term" placeholder="What are you watching?" />
            <button type="submit" className="search-button">
              <i className="FaSearch" />
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
);

export default Nav;
