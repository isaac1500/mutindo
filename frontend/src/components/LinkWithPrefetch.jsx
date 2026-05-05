import React from 'react';
import { Link } from 'react-router-dom';

const LinkWithPrefetch = ({ to, children, ...props }) => {
  const prefetch = () => {
    // Dynamically import the component when user hovers
    if (to === '/menu') {
      import('../pages/website/Menu');
    } else if (to === '/about') {
      import('../pages/website/About');
    } else if (to === '/catering') {
      import('../pages/website/Catering');
    }
  };

  return (
    <Link to={to} onMouseEnter={prefetch} onTouchStart={prefetch} {...props}>
      {children}
    </Link>
  );
};

export default LinkWithPrefetch;