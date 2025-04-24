import "./App.css";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import Services from "./Pages/Services";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignUp from "./components/Signup";
import MechanicDashboard from "./components/MechanicDashboard";
import MechDashboard from "./Pages/MechDashboard";
import MechLayout from "./components/MechLayout";
import MechanicRequests from "./components/MechanicRequests";

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
        },
      ],
    },
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
          element: <MechanicDashboard />,
        },
        {
          // 👇 This is now dynamic!
          path: "requests", // <- exact and dynamic!
          element: <MechanicRequests />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
