////////////////////////////////////////////////////////////////////////////////////////////////
// This is a reusable component that manages the logic for user authentication and authorization
////////////////////////////////////////////////////////////////////////////////////////////////
import { useState, useCallback, useEffect } from 'react';


var logoutTimer;  // Saves login time remaning for the current token


export const useAuth = () => {

  const [userId, setUserId] = useState('');                           // Saves id of the current user logged in
  const [userName, setUserName] = useState('');                       // Saves name of the current user logged in
  const [token, setToken] = useState('');                             // Saves the current token received from the backend
  const [tokenExpirationDate, setTokenExpirationDate] = useState(0);  // Time (in miliseconds) when the current token will expire

  // Executes user login, saving current user id, token in state, and also in localStorage
  // If expirationDate is set to a value, uses it. Otherwise, calculates it using the 
  // current moment as it's starting instant
  const login = useCallback((uid, name, token, expirationDate=0) => {
    setUserId(uid);
    setUserName(name);
    setToken(token);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);

    // State is saved in localStorage to allow automatic login when the page is refreshed
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        userName: name,
        token: token,
        expiration: tokenExpirationDate.toISOString()
      })
    );
  }, []);

  // Executes user logout, reseting all states
  const logout = useCallback(() => {
    setUserId('');
    setUserName('')
    setToken('');
    setTokenExpirationDate(0);
    localStorage.removeItem('userData');
  }, []);

  // This function is called whenever this Auth component is mounted first time, every time
  // token or tokenExpirationDate change, and whenever the logout function is called
  useEffect(() => {
    if (token && tokenExpirationDate) { 
      // If there's a user logged in, updates logout timer
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      // If there's no user logged in, resets logout timer
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  // This function is called whenever this Auth component is mounted first time,
  // and when the function login is called. Its purpose is to log the user back in 
  // automatically, whenever the page is refreshed.
  useEffect(() => {
    // Reads state data in localStorage
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) { // If there is state data in local storage, logs the user back in
      login(storedData.userId, storedData.userName, storedData.token, new Date(storedData.expiration));
    }
  }, [login]);

  return { userId, userName, token, login, logout };
};
