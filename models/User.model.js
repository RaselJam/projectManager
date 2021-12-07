import mongoose from 'mongoose';
const userSchema = mongoose.Schema({
  userName: {
    type: String,
    unique: true
  },
  password: String,
  isSuper: { type: Boolean, default: false }

})
var User = mongoose.model('User', userSchema);

export default User;