import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

function Protected({ allowedRoles }) {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user-info'));
    
    if (!userInfo) {
      // If the user is not logged in, navigate to the register page
      navigate('/register');
    } else if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
      // If the user does not have the required role, navigate to home or an unauthorized page
      navigate('/');
    }
  }, [navigate, allowedRoles]);

  return (
    <div className="login">
      <Outlet />
    </div>
  );
}

export default Protected;
