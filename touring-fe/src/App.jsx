import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";


import Home from "./pages/Home";
import MainHome from  "./pages/MainHome";
import DestinationPage from "./pages/Blogs";
import SearchResults from "./pages/SearchResults";


import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes >
      <Route element={<MainLayout/>}>
        <Route path="/" element={<Home />} />
      <Route path="/destinations/:slug" element={<DestinationPage />} />
      <Route path="/search" element={<SearchResults />} />
       <Route path="/home" element={< MainHome/>} />
      <Route path="*" element={<div className="p-6">404</div>} />
     
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
