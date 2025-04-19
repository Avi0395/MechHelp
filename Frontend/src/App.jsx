import "./App.css";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignUp from "./components/Signup";
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
          index: true, // Ensures Home is the default page inside /layout
          element: <Home />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
