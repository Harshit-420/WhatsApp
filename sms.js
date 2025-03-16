const SerialPort = require('serialport');

// अपने सिस्टम के अनुसार सीरियल पोर्ट पाथ समायोजित करें
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });

const sendSMS = (phoneNumber, text) => {
  return new Promise((resolve, reject) => {
    // AT कमांड्स भेजकर SMS मोड सेट करें और SMS भेजें
    port.write('AT+CMGF=1\r', (err) => {
      if (err) return reject('SMS मोड सेट करने में त्रुटि: ' + err);
      setTimeout(() => {
        port.write(`AT+CMGS="${phoneNumber}"\r`, (err) => {
          if (err) return reject('SMS भेजने की शुरुआत में त्रुटि: ' + err);
          setTimeout(() => {
            // मैसेज भेजें और Ctrl+Z (ASCII 26) से टर्मिनेट करें
            port.write(text + String.fromCharCode(26), (err) => {
              if (err) return reject('SMS टेक्स्ट भेजने में त्रुटि: ' + err);
              resolve('GSM के जरिए SMS भेज दिया गया');
            });
          }, 1000);
        });
      }, 1000);
    });
  });
};

module.exports = { sendSMS };
