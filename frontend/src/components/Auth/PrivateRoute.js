import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('authToken');
  
  // If no token, redirect to sign-in page
  if (!token) {
    return <Navigate to="/signin" />;
  }

  // If the token exists, render the element (the protected route)
  return element;
};

export default PrivateRoute;
