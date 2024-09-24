import { createContext, useState } from "react";

export const GlobalContext = createContext()

const AppProvider = (props) => {
  const [isDirty, setIsDirty] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState({})
  const [authToken, setAuthToken] = useState('')

  const handleErrors = (error) => {
    //for debug purposes we always log the error
    console.log(error)
    if (error.status === 500)
      return 'Something went wrong...'

    if (Array.isArray(error.jresp?.errorMsg))
      return error.jresp.errorMsg.join('. ')

    if (error.jresp?.errorMsg)
      return error.jresp.errorMsg

    if (typeof error === 'string')
      return error

    return 'Something went wrong...'
  }

  return (
    <GlobalContext.Provider value={{ isDirty, setIsDirty, isLoggedIn, setIsLoggedIn, user, setUser, authToken, setAuthToken, handleErrors }}>
      {props.children}
    </GlobalContext.Provider>
  )
};
export default AppProvider;
