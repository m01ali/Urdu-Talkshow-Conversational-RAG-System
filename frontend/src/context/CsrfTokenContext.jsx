import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';


// Create a Context
export const CsrfTokenContext = createContext();

export const CsrfTokenProvider = ({ children }) => {
  
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const storedCsrfToken = localStorage.getItem('csrfToken');
    if (storedCsrfToken) {
      setCsrfToken(storedCsrfToken);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('csrfToken');
    setCsrfToken('');
  };

  const handleUnauthorized = () => {
    logout();
    toast.error('Unauthorized. Please login.');
  };


  return (
    <CsrfTokenContext.Provider value={{ csrfToken, setCsrfToken , logout , handleUnauthorized}}>
      {children}
    </CsrfTokenContext.Provider>
  );
};

CsrfTokenProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

