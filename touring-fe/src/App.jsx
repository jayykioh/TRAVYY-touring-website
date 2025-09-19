import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DestinationPage from "./pages/Blogs";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/destinations/:slug" element={<DestinationPage />} />
      <Route path="*" element={<div className="p-6">404</div>} />
      
    </Routes>
  );
}
