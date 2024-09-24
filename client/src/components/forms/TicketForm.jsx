import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import API from "../../API";
import DATA from "../../data"
import { toast } from "react-toastify";
import { GlobalContext } from "../GlobalContext";

const TicketForm = ({ loadPredictions }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isConfirmation, setIsConfirmation] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [predictTime, setPredictTime] = useState('')
  const { setIsDirty, handleErrors } = useContext(GlobalContext)
  const { categories } = DATA

  const navigate = useNavigate()


  const handleSubmit = (e) => {
    e.preventDefault()
    setIsButtonLoading(true)
    const bodyData = { title, description, category }
    API.createTicket(bodyData)
      .then((ticket) => {
        toast.success('Ticket created')
        // setIsButtonLoading(false)
        setIsDirty(true)
        navigate('/')
      })
      .catch((err) => {
        toast.error(handleErrors(err))
        setIsButtonLoading(false)
      })
  }

  const handleConfirmation = async (e) => {
    e.preventDefault()
    try {
      if (!title.trim() || !category || !description.trim()) throw 'Title,description and category should not be empty'
      if (title.length > 160) throw 'Title can not be long more than 160 characters'
      if (description.length > 500) throw 'Description can not be long more than 500 characters'

      //if the server 2 is down it will not block the submission 
      const predictionsTime = await loadPredictions([{ title, category }])

      if (predictionsTime) {
        const { predTime } = predictionsTime[0]
        setPredictTime(predTime)
      }

      setIsConfirmation(true)

    } catch (error) {
      toast.error(handleErrors(error))
    }

  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={9}>
          {isConfirmation && <h2>Check your data before submitting the ticket</h2>}
          {isConfirmation && <h4 className="mt-3">Estimated time before ticket closure: {predictTime ? predictTime : 'not available'}</h4>}
          <Form onSubmit={handleSubmit} className="mt-5">
            <Form.Group className="mb-3">
              <Form.Label className="fs-4">Title</Form.Label>
              <Form.Control disabled={isConfirmation} required type='text' name='title' value={title} onChange={(e) => {
                if (!isConfirmation) setTitle(e.target.value)
              }}></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-4">Category</Form.Label>
              <Form.Select
                required
                disabled={isConfirmation}
                name='category'
                value={category}
                onChange={(e) => { if (!isConfirmation) setCategory(e.target.value) }}
              >
                <option value="">Select a Category</option>
                {categories.map((category, ind) => <option key={ind} value={`${category}`}>{category}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-4">Description</Form.Label>
              <Form.Control as={"textarea"} disabled={isConfirmation} required rows={4} type='text' name='description' value={description} onChange={(e) => {
                if (!isConfirmation) setDescription(e.target.value)
              }}></Form.Control>
            </Form.Group>
            {isConfirmation
              ? (
                isButtonLoading ?
                  (

                    <Button className='my-3' variant="primary" disabled>Loading...</Button>
                  )
                  : (

                    <Button type='submit' className='my-3' variant="primary">Submit</Button>
                  )
              )
              : (
                <Button type="button" className='my-3' variant="primary" onClick={handleConfirmation}>Next</Button>
              )
            }
            {isConfirmation
              ? (
                <Button variant='warning' className='mx-2' onClick={() => { setIsConfirmation(false) }}>Back</Button>
              )
              : (
                <Button variant='warning' className='mx-2' onClick={() => { navigate("/") }}>Cancel</Button>
              )
            }
          </Form>
        </Col>
      </Row >
    </Container >
  )
};
export default TicketForm;
