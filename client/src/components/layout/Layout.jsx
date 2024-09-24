import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = ({ setTicketPredictions }) => {
  return (
    <>
      <Navbar setTicketPredictions={setTicketPredictions} />
      <Outlet />
    </>
  )
};
export default Layout;
