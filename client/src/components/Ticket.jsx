import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "./GlobalContext";
import API from "../API";
import DATA from "../data"
import { Link } from "react-router-dom";
import { Button, Dropdown, DropdownButton, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const TextBlock = ({ author, id, text, timestamp }) => {

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h6 className="card-title">{author.name}, {timestamp}</h6>
          {text.split('\n').map((txt, ind) => {
            if (txt === "")
              //multiple new lines displayed correctly
              return <br key={ind} />
            else
              return <p className="my-0" key={ind}>{txt}</p>
          })
          }

        </div>
      </div>
    </div >
  )
}


const Ticket = ({ tick, prediction }) => {
  const { title, timestamp, owner, category, state, id } = tick
  const { isLoggedIn, user, setIsDirty, handleErrors } = useContext(GlobalContext)
  const [isExpanded, setIsExpanded] = useState(false)
  const [fullTicket, setFullTicket] = useState({})
  const [isEdit, setIsEdit] = useState(false)
  const [ticketCategory, setTicketCategory] = useState(category)
  const [areBlocksLoading, setAreBlocksLoading] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const { categories } = DATA

  const expandTicket = async () => {
    try {
      setAreBlocksLoading(true)
      setIsExpanded(true)
      const ticketInfos = await API.getTicketInfos(id)
      setFullTicket(ticketInfos)
      setAreBlocksLoading(false)
    } catch (error) {
      toast.error(handleErrors(error))
    }
  }

  const shrinkTicket = () => {
    setIsExpanded(false)
    setFullTicket({})
  }

  const editState = (state) => {
    setIsButtonLoading(true);

    API.updateTicketState({ id, state })
      .then(changes => {
        toast.success(`Ticket ${state}`)
        //setIsButtonLoading(false)
        setIsDirty(true)
      })
      .catch(err => {
        toast.error(handleErrors(err))
        setIsButtonLoading(false)
      })
  }

  const editCategory = () => {

    setIsCategoryLoading(true)
    setIsEdit(false)
    API.updateTicketCategoy({ id, category: ticketCategory })
      .then(({ itemsChanged }) => {
        if (itemsChanged !== 0) {
          toast.success('Category updated')
          setIsDirty(true)
        }
        setIsCategoryLoading(false)
      })
      .catch(err => {
        toast.error(handleErrors(err))
        setIsCategoryLoading(false)
      }
      )

  }


  const { ticket, textBlocks } = fullTicket

  return (
    <div className="container mt-5">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h5 className="card-title">{title}</h5>
            {isLoggedIn
              && (
                <div className="fs-4 d-flex align-items-center"  >

                  {/*Close ticket button*/}
                  {!isButtonLoading && (user.id === owner.id || user.role === 'admin') && state === 'open'
                    && <Button variant="danger" style={{ marginRight: '1rem', fontSize: '0.8rem' }} onClick={() => { editState('closed') }}>Close Ticket</Button>
                  }

                  {/*Open ticket button*/}
                  {!isButtonLoading && user.role === 'admin' && state === 'closed'
                    && <Button style={{ marginRight: '1rem', fontSize: '0.8rem' }} onClick={() => { editState('open') }}>Open Ticket</Button>
                  }

                  {/*Loading ticket button*/}
                  {isButtonLoading &&
                    <Button style={{ marginRight: '1rem', fontSize: '0.8rem' }} disabled >Loading...</Button>
                  }

                  {/*Add textblock button + expand icon change*/}
                  {isExpanded
                    ? (
                      <span>
                        {state === 'open'
                          && <Link to={`/addBlock/${id}`}><i className="bi bi-plus-square mx-3" style={{ cursor: 'pointer' }}></i></Link>
                        }
                        <i className="bi bi-arrow-up-circle" style={{ cursor: 'pointer' }} onClick={shrinkTicket} />

                      </span>
                    )
                    : <i className="bi bi-arrow-down-circle" style={{ cursor: 'pointer' }} onClick={expandTicket} />
                  }
                </div>
              )
            }

          </div>

          <div className="card-text text-capitalize">
            <strong>Date:</strong> <span >{timestamp}</span><br />
            <strong>Owner:</strong> <span >{owner.name}</span><br />
            <div className="d-flex align-items-center">
              <strong>Category:</strong>

              {/*If user is admin give the option to edit the category inline with a dropdown menu*/}
              {!isEdit ?
                (
                  isCategoryLoading ?
                    (
                      <span >Loading...</span>
                    ) :
                    (
                      <>
                        <span >{category}</span>
                        {user.role === 'admin'
                          && <span className="mx-2"><i className="bi bi-pencil" style={{ cursor: 'pointer' }} onClick={() => { setIsEdit(true) }} /></span>
                        }
                      </>
                    )
                )
                : (
                  <>
                    <DropdownButton id="dropdown-basic-button" title={ticketCategory} size='sm' className="mx-2 mt-2" onSelect={
                      (eventKey) => setTicketCategory(eventKey)}>

                      {categories.map((cat, ind) => {
                        if (cat != category)
                          return <Dropdown.Item key={ind} eventKey={`${cat}`}>{cat}</Dropdown.Item>
                      })}

                    </DropdownButton>
                    <div className="mt-2">
                      <i className="bi bi-check-lg mx-2 fs-5" style={{ cursor: 'pointer' }} onClick={editCategory}></i>
                      <i className="bi bi-trash fs-5" style={{ cursor: 'pointer' }} onClick={() => {
                        setTicketCategory(category)
                        setIsEdit(false)
                      }} />
                    </div>
                  </>
                )
              }
            </div>

            <strong>State:</strong><span >{state}</span><br />
            {isLoggedIn && user.role === 'admin' &&
              <>
                <strong>Closed in: </strong>
                {prediction && state === 'open' ? <span>{prediction.predTime}</span> : '-'}
              </>
            }

          </div>

          {/*Ticket description*/}
          {isExpanded &&
            (
              areBlocksLoading ?
                (
                  <div className="mt-2">
                    <Spinner animation="border" role="status"></Spinner>
                    <span className="mx-3">Loading...</span>
                  </div>
                )

                : (
                  <>
                    <div className="mt-3">
                      <strong>Description:</strong><br />
                      {ticket.description.split('\n').map((txt, ind) => {
                        if (txt === "")
                          //multiple new lines displayed correctly
                          return <br key={ind} />
                        else
                          return <p className="my-0" key={ind}>{txt}</p>
                      })}
                      <hr />
                    </div>
                    {textBlocks.map(block => <TextBlock key={block.id} {...block} />)}
                  </>
                )
            )
          }


        </div>
      </div >
    </div >
  )
};
export default Ticket;
