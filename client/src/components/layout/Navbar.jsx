import { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'
import { GlobalContext } from '../GlobalContext';
import API from '../../API';
import { toast } from 'react-toastify';

const Navbar = ({ setTicketPredictions }) => {
  const { isLoggedIn, setIsLoggedIn, setIsDirty, setUser, user, setAuthToken, handleErrors } = useContext(GlobalContext)
  const navigate = useNavigate()
  const doLogout = () => {
    API.logout()
      .then(resp => {
        setUser({})
        setAuthToken('')
        setIsLoggedIn(false)
        setTicketPredictions([])
        setIsDirty(true)
        navigate('/')
      }).catch(err => toast.error(handleErrors(err)))
  }

  return (

    <div className="container-fluid p-0">
      <nav className="navbar navbar-expand-md justify-content-between navbar-dark bg-primary px-3">
        <a className="navbar-brand " href="#">
          <i className="bi bi-ticket mx-2"></i>
          Ticketing system
        </a>

        {isLoggedIn &&
          (
            <Link to={'/addTicket'}>
              <i className='bi bi-plus-square text-white fs-3' style={{ cursor: 'pointer' }}></i>
            </Link>
          )

        }

        <div className="navbar-nav">
          {isLoggedIn
            ? (
              <div className="nav-item nav-link fs-5 mx-2 d-flex align-items-center" >
                <span className='mx-3 '>Hello {user.name}</span>
                <Button className="btn-warning" onClick={doLogout}>Logout</Button>
              </div>
            )
            : (
              <Link className="nav-item nav-link fs-4 mx-2" to="/login">
                <Button className="btn-warning">Login</Button>
              </Link>
            )

          }
        </div>
      </nav >
    </div >
  )
};
export default Navbar;
