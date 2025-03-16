const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bulk_messaging', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const messageSchema = new mongoose.Schema({
  recipient: String,
  message: String,
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  method: { type: String, enum: ['whatsapp', 'gsm'], default: 'whatsapp' }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { mongoose, Message };
