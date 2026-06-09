import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import CalculatorPage from "@/pages/Calculator";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CalculatorPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
}

export default App;
