// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './Login.css';

// function Login({ onLoginSuccess, account }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError('');

//   if (!username || !password) {
//     setError('Vui lòng nhập đầy đủ username và password');
//     return;
//   }

//   if (!account) {
//     setError('Vui lòng kết nối MetaMask');
//     return;
//   }

//   try {
//     const { data } = await axios.post('http://localhost:5000/api/auth/login', { username, password });
    
//     console.log('Response data:', data);

//     const { token, address } = data;

//     if (!token || !address) {
//       setError('Dữ liệu trả về không hợp lệ');
//       return;
//     }

//     if (address.toLowerCase() !== account.toLowerCase()) {
//       setError('Địa chỉ MetaMask không khớp với tài khoản');
//       return;
//     }

//     onLoginSuccess(token, address);
//     navigate('/');
//   } catch (err) {
//     console.error(err);
//     setError(err.response?.data?.msg || err.message || 'Lỗi đăng nhập');
//   }
// };


//   return (
//     <div>
//       <h2>Đăng nhập</h2>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Username:</label>
//           <input
//             type="text"
//             placeholder="Tên đăng nhập"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Password:</label>
//           <input
//             type="password"
//             placeholder="Mật khẩu"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Đăng nhập</button>
//       </form>
//       <p>
//         Chưa có tài khoản?{' '}
//         <Link to="/register" style={{ color: 'blue', textDecoration: 'underline' }}>
//           Đăng ký ngay
//         </Link>
//       </p>
//     </div>
//   );
// }

// export default Login;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ onLoginSuccess, account }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ username và password');
      setIsLoading(false);
      return;
    }

    if (!account) {
      setError('Vui lòng kết nối MetaMask');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      
      console.log('Response data:', data);

      const { token, address } = data;
      if (!token || !address) {
        setError('Dữ liệu trả về không hợp lệ');
        setIsLoading(false);
        return;
      }

      if (address.toLowerCase() !== account.toLowerCase()) {
        setError('Địa chỉ MetaMask không khớp với tài khoản');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(token, address);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message || 'Lỗi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo">🚀</div>
          </div>
          <h2 className="login-title">Chào mừng trở lại!</h2>
          <p className="login-subtitle">Đăng nhập để tiếp tục hành trình của bạn</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <div className="input-container">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-container">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-text">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="register-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="metamask-status">
          <div className={`status-indicator ${account ? 'connected' : 'disconnected'}`}></div>
          <span className="status-text">
            {account ? `MetaMask: ${account.slice(0, 6)}...${account.slice(-4)}` : 'MetaMask chưa kết nối'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;