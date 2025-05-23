
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Web3 from "web3";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProductDetail from "./components/ProductDetail"; // Import ProductDetail
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [error, setError] = useState("");

  useEffect(() => {
    const connectMetaMask = async () => {
      if (!window.ethereum) {
        setError("Vui lòng cài đặt MetaMask!");
        return;
      }

      try {
        const web3 = new Web3(window.ethereum);
        const chainId = await web3.eth.getChainId();
        const sepoliaChainId = 11155111;
        if (Number(chainId) !== sepoliaChainId) {
          setError("Vui lòng chuyển MetaMask sang mạng Sepolia!");
          return;
        }

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        setError("");

        window.ethereum.on("accountsChanged", (newAccounts) => {
          setAccount(newAccounts[0] || null);
        });

        window.ethereum.on("chainChanged", (newChainId) => {
          if (Number(newChainId) !== sepoliaChainId) {
            setError("Vui lòng chuyển MetaMask sang mạng Sepolia!");
            setAccount(null);
          } else {
            connectMetaMask();
          }
        });
      } catch (err) {
        setError("Không thể kết nối MetaMask. Vui lòng thử lại.");
        console.error("Lỗi MetaMask:", err);
      }
    };

    connectMetaMask();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    setError("");
  };

  const handleLoginSuccess = (newToken, address) => {
    if (address.toLowerCase() !== account?.toLowerCase()) {
      setError("Địa chỉ MetaMask không khớp với tài khoản đăng nhập");
      return;
    }
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    setError("");
  };

  return (
    <Router>
      <div className="App">
        <header>
          <h1>Organic Supply Chain</h1>
          {account ? <p>Tài khoản: {account}</p> : <p>Chưa kết nối MetaMask</p>}
          {isAuthenticated && <button onClick={handleLogout}>Đăng xuất</button>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </header>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated && account ? (
                <Dashboard account={account} token={token} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} account={account} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Register account={account} />
              )
            }
          />
          <Route
            path="/product/:tokenId"
            element={
              isAuthenticated && account ? (
                <ProductDetail />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;