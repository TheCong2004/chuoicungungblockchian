// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===== Đăng ký =====
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, address } = req.body;

    if (!username || !email || !password || !address) {
      return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Kiểm tra username hoặc email trùng
    const exists = await User.findOne({
      $or: [
        { username: username.trim().toLowerCase() },
        { email: email.trim().toLowerCase() }
      ]
    });
    if (exists) {
      return res.status(400).json({ msg: 'Username hoặc email đã tồn tại' });
    }

    // Mã hoá mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    // Lưu user mới
    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      address: address.toLowerCase() // 👈 Lưu địa chỉ dạng lowercase
    });
    await newUser.save();

    // Tạo JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      msg: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        address: newUser.address
      },
      token
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Username hoặc email đã tồn tại' });
    }
    next(err);
  }
};

// ===== Đăng nhập =====
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Vui lòng nhập username và password' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Sai tên đăng nhập' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Sai mật khẩu' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      msg: 'Đăng nhập thành công',
      token,
      address: user.address, // 👈 Trả về address ở đây để frontend kiểm tra với MetaMask
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};
