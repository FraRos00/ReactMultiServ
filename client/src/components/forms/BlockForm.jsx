import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import API from "../../API";
import { toast } from "react-toastify";
import { GlobalContext } from "../GlobalContext";

const BlockForm = () => {
  // NOTE: This is treated as a string
  const { ticketId } = useParams()
  const [text, setText] = useState('')
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const { handleErrors } = useContext(GlobalContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsButtonLoading(true)
    try {

      if (!text.trim()) throw 'Description can not be empty'
      if (text.length > 500) throw 'Description can not be long more than 500 characters'
      const bodyData = { id: Number(ticketId), text }
      await API.createTextBlock(bodyData)
      toast.success('Response addedd')
      //setIsButtonLoading(false)
      navigate('/')
    } catch (err) {
      toast.error(handleErrors(err))
      setIsButtonLoading(false)
    }

  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={9}>
          <h2>Add a new response to the ticket</h2>
          <Form onSubmit={handleSubmit} className="mt-5">
            <Form.Group>
              <Form.Label className="fs-4">Description</Form.Label>
              <Form.Control as={"textarea"} required rows={4} type='text' name='text' value={text} onChange={(e) => { setText(e.target.value) }}></Form.Control>
            </Form.Group>
            {isButtonLoading ?
              (
                <Button className='my-3' variant="primary" disabled>Loading...</Button>
              ) :
              (
                <Button type='submit' className='my-3' variant="primary">Submit</Button>
              )
            }
            <Button variant='warning' className='mx-2' onClick={() => { navigate("/") }}>Cancel</Button>
          </Form>
        </Col>
      </Row >
    </Container >
  )

};
export default BlockForm;
