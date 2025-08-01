import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import SetUpPage from "./pages/Setup";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<SetUpPage />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
