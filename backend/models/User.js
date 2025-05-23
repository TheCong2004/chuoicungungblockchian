const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // ten dang nhap
  email: { type: String, required: true, unique: true },    // email phai duy nhat
  password: { type: String, required: true },                // mat khau
  address:  { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
