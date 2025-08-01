import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import SetUpPage from "./pages/Setup";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<SetUpPage />} />
    </Routes>
  );
}

export default App;
