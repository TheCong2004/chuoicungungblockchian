import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  // Lấy địa chỉ MetaMask khi component mount
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          if (accounts.length > 0) setAddress(accounts[0]);
          else setError('Vui lòng kết nối MetaMask và chọn tài khoản');
        })
        .catch(err => setError('Lỗi kết nối MetaMask: ' + err.message));
    } else {
      setError('Bạn cần cài đặt MetaMask để đăng ký');
    }
  }, []);

  const handleRegister = async () => {
    if (!address) {
      setError('Chưa có địa chỉ MetaMask');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, address }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Đăng ký thành công');
        setError('');
      } else {
        alert(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối server');
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="text"
        placeholder="Tên đăng nhập"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />

      <div>
        <label>Địa chỉ MetaMask: </label>
        <input
          type="text"
          value={address}
          readOnly
          style={{ width: '400px', backgroundColor: '#f0f0f0' }}
        />
      </div><br />

      <button onClick={handleRegister}>Đăng Ký</button>

      <p>
        Đã có tài khoản?{' '}
        <Link to="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}

export default Register;
