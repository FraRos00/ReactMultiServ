import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../API';
import { GlobalContext } from '../GlobalContext';
import { toast } from 'react-toastify';


const Login = ({ renewToken }) => {
  // The credentials are pre-set only for the exam to speed up the testing.... they should not be set in real world scenarios...
  const [username, setUsername] = useState('john@test.com');
  const [password, setPassword] = useState('pwd');
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const { setUser, setIsLoggedIn, setIsDirty, handleErrors } = useContext(GlobalContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsButtonLoading(true)
    try {
      if (!username.trim() || !password.trim()) throw 'Username and Password can not be empty'
      const credentials = { username, password }
      const user = await API.login(credentials)
      await renewToken()
      setUser(user)
      setIsLoggedIn(true)
      // toast.success('Logged in successfully!')
      setIsDirty(true)
      navigate('/')

    } catch (error) {
      toast.error(handleErrors(error))
      setIsButtonLoading(false)
    }

  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row>
        <Col>
          <Form className="p-4 border rounded" style={{ width: '50vw', marginBottom: '10rem' }} onSubmit={(e) => handleSubmit(e)}>
            <Form.Group controlId="formUsername">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="username" required placeholder="email@email.com" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" required name="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <div className="mt-3">
              {isButtonLoading ?
                (
                  <Button variant="primary" className='mx-1' disabled>
                    Loading...
                  </Button>
                )
                : (
                  <Button variant="primary" type="submit" className='mx-1' >
                    Login
                  </Button>

                )
              }
              <Button variant='warning' onClick={() => { navigate('/') }}>Cancel</Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container >
  )
};
export default Login;
