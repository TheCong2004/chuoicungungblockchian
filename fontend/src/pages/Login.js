import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ onLoginSuccess, account }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!username || !password) {
    setError('Vui lòng nhập đầy đủ username và password');
    return;
  }

  if (!account) {
    setError('Vui lòng kết nối MetaMask');
    return;
  }

  try {
    const { data } = await axios.post('http://localhost:5000/api/auth/login', { username, password });
    
    console.log('Response data:', data);

    const { token, address } = data;

    if (!token || !address) {
      setError('Dữ liệu trả về không hợp lệ');
      return;
    }

    if (address.toLowerCase() !== account.toLowerCase()) {
      setError('Địa chỉ MetaMask không khớp với tài khoản');
      return;
    }

    onLoginSuccess(token, address);
    navigate('/');
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.msg || err.message || 'Lỗi đăng nhập');
  }
};


  return (
    <div>
      <h2>Đăng nhập</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      <p>
        Chưa có tài khoản?{' '}
        <Link to="/register" style={{ color: 'blue', textDecoration: 'underline' }}>
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default Login;
