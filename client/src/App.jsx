import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Layout from './components/layout/Layout';
import Login from './components/forms/Login';
import IndexRoute from './components/IndexRoute';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BlockForm from './components/forms/BlockForm';
import TicketForm from './components/forms/TicketForm';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from './components/GlobalContext';
import API from './API';


const App = () => {

  const { isLoggedIn, setIsLoggedIn, setAuthToken, authToken, setUser, setIsDirty } = useContext(GlobalContext)
  const [tickets, setTickets] = useState([])
  const [ticketsPredictions, setTicketPredictions] = useState([])

  const renewToken = async () => {
    try {
      const { token } = await API.getAuthToken()
      setAuthToken(token)
    } catch (err) { }
  }


  const loadPredictions = async (array) => {
    try {
      const predictions = await API.getPredictionTime(authToken, array)
      return predictions
    } catch (error) {
      //the token is automatically renew so if there is an error it's not because the ticket is expired
    }
  }


  //check if the user has already a valid cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setIsLoggedIn(true);
        await renewToken()
        setUser(user);
        setIsDirty(true)
      } catch (err) {
        // nothing... user is simply not yet authenticated
      }
    };

    if (!isLoggedIn)
      checkAuth();
  }, []);

  //This will renew the token automatically before expiration
  //a more advanced setting could involve decoding the token to get dinamically the expiration time.
  useEffect(() => {
    let intervalId;

    if (isLoggedIn) {
      //debug
      console.log('interval set')
      intervalId = setInterval(() => {
        renewToken();
        //DEBUG TO CHECK THAT I DON'T CREATE MORE THAN ONE INTERVAL
        console.log('interval run')
      }, 59000); // 59000 milliseconds = 59 seconds
    }

    // Cleanup function to clear the interval
    return () => {
      if (intervalId) {
        //debug
        console.log('interval cleared')
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout setTicketPredictions={setTicketPredictions} />}>
          <Route index element={<IndexRoute tickets={tickets} setTickets={setTickets} ticketsPredictions={ticketsPredictions} setTicketPredictions={setTicketPredictions} loadPredictions={loadPredictions} />} />
          <Route path='/addBlock/:ticketId' element={<BlockForm />} />
          <Route path='/addTicket' element={<TicketForm loadPredictions={loadPredictions} />} />
        </Route>
        <Route path='/login' element={<Login renewToken={renewToken} />} />
      </Routes>
    </BrowserRouter>
  )
};
export default App;

