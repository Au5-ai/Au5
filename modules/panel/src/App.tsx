import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Setup from "./pages/Setup";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<Setup />} />
    </Routes>
  );
}

export default App;
