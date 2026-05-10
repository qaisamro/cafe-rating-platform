import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Cafes from "./pages/Cafes";
import Moderation from "./pages/Moderation";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/cafes" element={<Cafes />} />
        <Route path="/moderation" element={<Moderation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;