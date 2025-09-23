import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DestinationPage from "./pages/Blogs";
import Login from "./pages/Login";
import Register from "./pages/Register";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/destinations/:slug" element={<DestinationPage />} />
      <Route path="*" element={<div className="p-6">404</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
