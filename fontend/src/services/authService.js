// authService.js

const TOKEN_KEY = 'token';

/**
 * Lưu token vào localStorage sau khi đăng nhập thành công
 * @param {string} token - Chuỗi JWT token từ backend
 */
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Xóa token khỏi localStorage (đăng xuất)
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Lấy token từ localStorage
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Kiểm tra người dùng hiện tại từ token
 * @returns {object|null} - Thông tin người dùng (decoded từ JWT) hoặc null
 */
export const getUser = () => {
  const token = getToken();
  if (!token) return null;

  try {
    // Tách phần payload của JWT (ở giữa, dạng base64)
    const payload = token.split('.')[1];
    const decoded = atob(payload); // giải mã base64
    return JSON.parse(decoded); // chuyển thành object
  } catch (error) {
    console.error('Lỗi giải mã token:', error);
    return null;
  }
};

/**
 * Kiểm tra xem đã đăng nhập chưa
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};
