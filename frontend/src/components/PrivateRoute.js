import React from 'react';
import { Route, Redirect } from 'react-router-dom';

/**
 * Private Route component for protected routes
 * Redirects to login page if user is not authenticated
 */
const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect
            to={{
              pathname: '/',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;