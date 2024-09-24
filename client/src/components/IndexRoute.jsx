import { useContext, useEffect, useState } from "react";
import API from "../API";
import { Spinner } from "react-bootstrap";
import { GlobalContext } from "./GlobalContext";
import Ticket from "./Ticket";

const IndexRoute = ({ tickets, setTickets, setTicketPredictions, ticketsPredictions, loadPredictions }) => {
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)


  const { isDirty, setIsDirty, user, authToken } = useContext(GlobalContext)


  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true)
        setIsError(false)
        const ticketsReceived = await API.getTickets()
        setTickets(ticketsReceived)
        // ask predictions for open tickets sending only necessary information
        if (user.role === 'admin' && authToken) {
          const predictions = await loadPredictions(ticketsReceived.filter(t => t.state === 'open').map((t) => {
            return { id: t.id, title: t.title, category: t.category }
          }))
          if (predictions) setTicketPredictions(predictions)
        }
        setIsLoading(false)
        setIsDirty(false)
      } catch (error) {
        setIsLoading(false)
        setIsError(true)
      }
    }
    if (isDirty) {
      fetchTickets()
    }
  }, [isDirty])

  if (isError)
    return <h1 className="my-5 text-center">Something went wrong...</h1>

  if (isLoading)
    return <div className="my-5 text-center">
      <Spinner animation="border" role="status"></Spinner>
      <span className="mx-3">Loading...</span>
    </div>

  return (
    <div className="mb-5">{tickets.map((ticket) => {
      return <Ticket key={ticket.id} tick={ticket} prediction={ticketsPredictions.find((pred) => pred.id === ticket.id)} />
    })}
    </div>
  )
};
export default IndexRoute;
