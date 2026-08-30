import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DocumentUpload from "./pages/DocumentUpload";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = localStorage.getItem("access_token");

  return accessToken ? children : <Navigate replace to="/login" />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup></Signup>}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route
            path="/document"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/upload"
            element={
              <ProtectedRoute>
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/:id"
            element={
              <ProtectedRoute>
                <DocumentDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
