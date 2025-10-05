import "./App.css";
import Home from "./Pages/Home";
import Layout from "./components/Layout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignUp from "./components/SignUp";
import NearbyMechanic from "./Pages/NearbyMechanic";
import UserProfile from "./Pages/UserProfile";
import MechLayout from "./components/MechLayout"
import MechanicProfile from "./Pages/MechanicProfile";
import MechanicRequests from "./Pages/MechanicRequests"
import MechDashboard from "./Pages/MechDashboard"
import MechanicRequestHistory from "./Pages/MechanicRequestHistory";
import UserRequests from "./Pages/UserRequests";
import UserRequestHistory from "./Pages/UserRequestHistory";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <SignUp />,
    },
    {
      path: "/layout",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "nearby-mechanic",
          element: <NearbyMechanic />,
        },
        {
          path: "profile",
          element: < UserProfile />,
        },
        {
          path: "track",
          element: < UserRequests />,
        }, {
          path: "history",
          element: < UserRequestHistory />,
        },


      ],
    },
    // Add the new route for mechanic dashboard
    {
      path: "/mechdashboard",
      element: <MechLayout />,
      children: [
        {
          index: true,
          element: <MechDashboard />,
        },
        {
          path: "profile",
          element: <MechanicProfile />,
        },
        {

          path: "requests",
          element: <MechanicRequests />,
        },
        {
          path: "history",
          element: < MechanicRequestHistory />,
        }
      ],
    },

  ]);

  return <RouterProvider router={router} />;
}

export default App;