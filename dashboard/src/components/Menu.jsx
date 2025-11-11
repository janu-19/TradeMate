import React from "react";
import { NavLink } from "react-router-dom";

const Menu = () => {
  return (
    <nav className="menu">
      <ul>
        <li><NavLink to="/" end>Summary</NavLink></li>
        <li><NavLink to="/orders">Orders</NavLink></li>
        <li><NavLink to="/holdings">Holdings</NavLink></li>
        <li><NavLink to="/positions">Positions</NavLink></li>
        <li><NavLink to="/funds">Funds</NavLink></li>
        <li><NavLink to="/apps">Apps</NavLink></li>
      </ul>
    </nav>
  );
};

export default Menu;