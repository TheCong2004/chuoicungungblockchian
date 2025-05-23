// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// function Register() {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [address, setAddress] = useState('');
//   const [error, setError] = useState('');

//   // Lấy địa chỉ MetaMask khi component mount
//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum.request({ method: 'eth_requestAccounts' })
//         .then(accounts => {
//           if (accounts.length > 0) setAddress(accounts[0]);
//           else setError('Vui lòng kết nối MetaMask và chọn tài khoản');
//         })
//         .catch(err => setError('Lỗi kết nối MetaMask: ' + err.message));
//     } else {
//       setError('Bạn cần cài đặt MetaMask để đăng ký');
//     }
//   }, []);

//   const handleRegister = async () => {
//     if (!address) {
//       setError('Chưa có địa chỉ MetaMask');
//       return;
//     }
//     try {
//       const res = await fetch('http://localhost:5000/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, email, password, address }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         alert('Đăng ký thành công');
//         setError('');
//       } else {
//         alert(data.message || 'Đăng ký thất bại');
//       }
//     } catch (err) {
//       alert('Lỗi kết nối server');
//     }
//   };

//   return (
//     <div>
//       <h2>Đăng ký</h2>
//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       <input
//         type="text"
//         placeholder="Tên đăng nhập"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       /><br /><br />

//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       /><br /><br />

//       <input
//         type="password"
//         placeholder="Mật khẩu"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       /><br /><br />

//       <div>
//         <label>Địa chỉ MetaMask: </label>
//         <input
//           type="text"
//           value={address}
//           readOnly
//           style={{ width: '400px', backgroundColor: '#f0f0f0' }}
//         />
//       </div><br />

//       <button onClick={handleRegister}>Đăng Ký</button>

//       <p>
//         Đã có tài khoản?{' '}
//         <Link to="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
//           Đăng nhập ngay
//         </Link>
//       </p>
//     </div>
//   );
// }

// export default Register;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Lấy địa chỉ MetaMask khi component mount
  useEffect(() => {
    if (window.ethereum) {
      setIsConnecting(true);
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setError('');
          } else {
            setError('Vui lòng kết nối MetaMask và chọn tài khoản');
          }
        })
        .catch(err => setError('Lỗi kết nối MetaMask: ' + err.message))
        .finally(() => setIsConnecting(false));
    } else {
      setError('Bạn cần cài đặt MetaMask để đăng ký');
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!address) {
      setError('Chưa có địa chỉ MetaMask');
      return;
    }

    if (!username || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, address }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setError('');
        // Reset form
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="register-card">
        <div className="register-header">
          <div className="logo-container">
            <div className="logo">🌱</div>
          </div>
          <h2 className="register-title">Tham gia Organic Supply Chain</h2>
          <p className="register-subtitle">Tạo tài khoản để quản lý chuỗi cung ứng hữu cơ</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="register-form">
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
              <span className="input-icon">📧</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          <div className="input-group">
            <label className="input-label">Địa chỉ MetaMask</label>
            <div className="metamask-container">
              <span className="metamask-icon">🦊</span>
              <input
                type="text"
                value={address || (isConnecting ? 'Đang kết nối...' : 'Chưa kết nối')}
                readOnly
                className="metamask-input"
              />
              {address && (
                <div className="connected-badge">
                  <span className="connected-dot"></span>
                  Đã kết nối
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className={`register-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !address}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        <div className="register-footer">
          <p className="login-text">
            Đã có tài khoản?{' '}
            <Link to="/login" className="login-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        <div className="metamask-status">
          <div className={`status-indicator ${address ? 'connected' : 'disconnected'}`}></div>
          <span className="status-text">
            {address ? `MetaMask: ${address.slice(0, 6)}...${address.slice(-4)}` : 'MetaMask chưa kết nối'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;