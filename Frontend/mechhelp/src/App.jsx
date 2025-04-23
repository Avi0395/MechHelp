import "./App.css";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import Services from "./Pages/Services";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignUp from "./components/Signup";
import MechanicDashboard from "./components/MechanicDashboard"; // Import the new component
import UserRequests from "./components/UserRequests"; // Import the new component
import MechanicRequests from "./components/MechanicRequests"; // Import the new component

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
          path: "services",
          element: <Services />,
        }

      ],
    },
    // Add the new route for mechanic dashboard
    {
      path: "/mechanic-dashboard",
      element: <MechanicDashboard />,
    }
    ,
    {
      path: "/user-requests/:userId", // Route for user requests
      element: <UserRequests />,
    },
    {
      path: "/mechanic-requests/:mechanicId", // Route for mechanic requests
      element: <MechanicRequests />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;