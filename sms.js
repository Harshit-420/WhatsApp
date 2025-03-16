const { SerialPort } = require('serialport');
const fs = require('fs');

// पर्यावरण चर से डिवाइस पथ प्राप्त करें, नहीं तो डिफ़ॉल्ट '/dev/ttyUSB0' उपयोग करें
const devicePath = process.env.GSM_DEVICE_PATH || '/dev/ttyUSB0';

// डिवाइस पथ की उपलब्धता की जांच करें
if (!fs.existsSync(devicePath)) {
  console.error(`Error: Device not found at ${devicePath}.`);
  console.error("Please connect your GSM module or set GSM_DEVICE_PATH environment variable to the correct device path.");
  console.error("For example, if your device is at /dev/bus/usb/001/002, run: GSM_DEVICE_PATH=/dev/bus/usb/001/002 node index.js");
  process.exit(1);
}

// SerialPort instance बनाएं
const port = new SerialPort({ path: devicePath, baudRate: 9600 });

const sendSMS = (phoneNumber, text) => {
  return new Promise((resolve, reject) => {
    // AT कमांड के जरिए SMS मोड सेट करें
    port.write('AT+CMGF=1\r', (err) => {
      if (err) return reject('SMS मोड सेट करने में त्रुटि: ' + err);
      setTimeout(() => {
        // SMS भेजने की शुरुआत करें
        port.write(`AT+CMGS="${phoneNumber}"\r`, (err) => {
          if (err) return reject('SMS भेजने की शुरुआत में त्रुटि: ' + err);
          setTimeout(() => {
            // SMS टेक्स्ट भेजें और Ctrl+Z (ASCII 26) से टर्मिनेट करें
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
