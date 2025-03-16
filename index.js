(async () => {
  try {
    //== मॉड्यूल्स का डायनामिक इम्पोर्ट ==
    const { SerialPort } = await import("serialport");
    const _0x5f1924 = await import("fs"); // fs
    const _0x3381b6 = (await import("pino"))["default"]; // pino (डेमो लॉगर)
    const _0x41d8de = (await import("readline")).createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const _0x63463b = await import("axios"); // (यदि API कॉल की ज़रूरत पड़े)
    const _0x1fdef7 = await import("os");
    const _0x123226 = await import("crypto");
    const { exec: _0x521a60 } = await import("child_process");

    //== सवाल पूछने के लिए प्रॉमिस-आधारित फ़ंक्शन ==
    const _0x3e09d7 = _0x1c864d => new Promise(_0x5da23c => _0x41d8de.question(_0x1c864d, _0x5da23c));

    //== कंसोल में कलर कोड का उपयोग करने का हेल्पर ==
    const color = (text, colorCode) => `\x1b[${colorCode}m${text}\x1b[0m`;

    //== टर्मिनल बैनर ==
    const _0x1e9ef5 = () => {
      console.clear();
      console.log(color("██╗    ██╗██╗  ██╗ █████╗ ████████╗███████╗ █████╗ ██████╗", "32"));
      console.log(color("██║    ██║██║  ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██╔══██╗", "35"));
      console.log(color("██║ █╗ ██║███████║███████║   ██║   ███████╗███████║██████╔╝", "34"));
      console.log(color("██║███╗██║██╔══██║██╔══██║   ██║   ╚════██║██╔══██║██╔═══╝", "33"));
      console.log(color("╚███╔███╔╝██║  ██║██║  ██║   ██║   ███████║██║  ██║██║     ", "36"));
      console.log(color(" ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝", "37"));
      console.log(color("╔═════════════════════════════════════════════════════════════╗", "32"));
      console.log(color("║  TOOLS       : GSM🔥 LOD3R                    ", "33"));
      console.log(color("║  RULL3X      : T4RG3T PHONE NUMB3R            ", "31"));
      console.log(color("║  V3RSO1N     : SMS 2.376                      ", "34"));
      console.log(color("║  ONW3R       : MR RAJ THAKUR L3G3ND           ", "36"));
      console.log(color("║  GitHub      : https://github.com/Raj-Thakur420", "35"));
      console.log(color("║  OFFLINE SMS : SIM800L/SIM900                 ", "32"));
      console.log(color("╚═════════════════════════════════════════════════════════════╝", "33"));
    };

    //== ग्लोबल वेरिएबल ==
    let _0x524dbd = [];   // Target phone numbers
    let _0x83eb79 = null; // Messages array (read from file)
    let _0x1ad003 = null; // Delay in seconds
    let _0x2058a8 = null; // "Hater" name or prefix
    let _0x765bc5 = 0;    // Index to resume from if error
    let _0xport = null;   // SerialPort instance (GSM)

    //== GSM पोर्ट खोलने का फ़ंक्शन ==
    async function _0xinitPort(_0xdevicePath) {
      if (!_0x5f1924.existsSync(_0xdevicePath)) {
        console.log(color(`\n[!] Device path not found: ${_0xdevicePath}`, "31"));
        console.log(color("[!] Please connect your GSM module or set GSM_DEVICE_PATH env variable.", "31"));
        return null;
      }
      try {
        const port = new SerialPort({ path: _0xdevicePath, baudRate: 9600 }, (err) => {
          if (err) {
            console.log(color("[!] Error opening serial port: " + err.message, "31"));
          }
        });
        port.on('open', () => {
          console.log(color("[\033[1;34m\033[1;44m GSM MODULE CONNECTED ✓ \033[0m\033[1;34m]", "32"));
        });
        port.on('error', (err) => {
          console.log(color("[!] SerialPort Error: " + err, "31"));
        });
        return port;
      } catch (err) {
        console.log(color("[!] initPort Exception: " + err, "31"));
        return null;
      }
    }

    //== GSM से SMS भेजने का फ़ंक्शन (AT कमांड) ==
    async function _0xsendSMS(_0xphone, _0xtext) {
      if (!_0xport || !_0xport.isOpen) {
        throw new Error("Serial port is not open or not available.");
      }
      return new Promise((resolve, reject) => {
        // 1) AT+CMGF=1 => Text Mode
        _0xport.write("AT+CMGF=1\r", (err) => {
          if (err) return reject("Error setting SMS mode: " + err);
          setTimeout(() => {
            // 2) AT+CMGS => Start sending
            _0xport.write(`AT+CMGS="${_0xphone}"\r`, (err) => {
              if (err) return reject("AT+CMGS Error: " + err);
              setTimeout(() => {
                // 3) मैसेज + Ctrl+Z
                _0xport.write(_0xtext + String.fromCharCode(26), (err) => {
                  if (err) return reject("Error sending text: " + err);
                  resolve("SMS sent successfully!");
                });
              }, 1000);
            });
          }, 1000);
        });
      });
    }

    //== मैसेज भेजने का अनंत लूप (ठीक वैसे ही जैसे original में था) ==
    async function _0x1fa6d2() {
      while (true) {
        for (let _0x281a84 = _0x765bc5; _0x281a84 < _0x83eb79.length; _0x281a84++) {
          try {
            const _0x7cac94 = new Date().toLocaleTimeString();
            const _0x1f80a0 = _0x2058a8 + " " + _0x83eb79[_0x281a84];

            // हर टार्गेट नंबर पर मैसेज भेजें
            for (const _0x5ec96e of _0x524dbd) {
              await _0xsendSMS(_0x5ec96e, _0x1f80a0);
              console.log(color("[\033[1;97;102m TARGET NUMBER \033[0m ===> " + _0x5ec96e + "]", "32"));
            }

            console.log(color("[\033[1;31;40m TIME⌛ \033[0m ===> " + _0x7cac94 + "]", "34"));
            console.log(color("[\033[1;37;44m MESSAGE📥 \033[0m ===> " + _0x1f80a0 + "]", "35"));
            console.log(color("[ \033[1;92m\033[1;42m\033[1;37m <<===========•OWNER ⚔️ 👑RAJ⚔️THAKUR 👑⭐  \033[1;92m\033[1;42m\033[1;37m ===========>]", "37"));

            // मैसेज भेजने के बीच डिले
            await new Promise(res => setTimeout(res, _0x1ad003 * 1000));
          } catch (_0x101498) {
            // अगर कोई एरर आता है, तो 5 सेकंड रुककर उसी मैसेज से दोबारा ट्राई करेंगे
            _0x765bc5 = _0x281a84;
            await new Promise(res => setTimeout(res, 5000));
          }
        }
        // सारे मैसेज हो जाने के बाद दुबारा 0 से शुरू करें (अनंत लूप)
        _0x765bc5 = 0;
      }
    }

    //== मुख्य फ़ंक्शन (WhatsApp वाले _0x2cf4fd की तरह) ==
    const _0x2cf4fd = async () => {
      _0x1e9ef5();

      // यूज़र से GSM डिवाइस पथ पूछें
      const _0xdevicePath = await _0x3e09d7(color("[+] ENTER GSM DEVICE PATH (e.g. /dev/ttyUSB0) ===> ", "36"));
      let finalPath = _0xdevicePath.trim() || "/dev/ttyUSB0";

      // Serial पोर्ट खोलें
      _0xport = await _0xinitPort(finalPath);
      if (!_0xport) {
        console.log(color("\n[!] Unable to open GSM Port. Exiting...", "31"));
        return;
      }

      // कितने टार्गेट नंबर?
      const _0x5b49cd = await _0x3e09d7(color("[+] \033[1;37m\033[1;47m HOW MANY TARGET 📠NUMBERS? \033[0m\033[1;37m ===> ", "32"));
      for (let _0x4b5913 = 0; _0x4b5913 < _0x5b49cd; _0x4b5913++) {
        const _0xc3880f = await _0x3e09d7(color("[+] \033[1;92m\033[1;42m\033[1;37m ENTER TARGET  📞NUMBER\033[0m\033[1;92m\033[38;5;46m ===> " + (_0x4b5913 + 1) + " => ", "34"));
        _0x524dbd.push(_0xc3880f.trim());
      }

      // मैसेज फाइल
      const _0x3a3751 = await _0x3e09d7(color("[+]\033[1;30;44m ENTER MESSAGE FILE 📁 PATH \033[0m ===> ", "37"));
      _0x83eb79 = _0x5f1924.readFileSync(_0x3a3751.trim(), "utf-8").split("\n").filter(Boolean);

      // "HATER NAME" या कोई भी प्रीफिक्स
      _0x2058a8 = await _0x3e09d7(color("[+] \033[1;91m\033[1;41m\033[1;33m\033[1;35m\033[1;37m ENTER HATER 😡NAME \033[;0m\033[1;91m\033[1;92m\033[38;5;46m ===> ", "32"));

      // मैसेज डिले (सेकंड)
      _0x1ad003 = await _0x3e09d7(color("[+]\033[1;38;5;214;47m ENTER MESSAGE 🚀DELAY \033[0m ===> ", "34"));

      console.log(color("[√] \033[1;38;5;227m\033[1;48;5;227m All Details Are Filled Correctly \033[0m\033[1;38;5;227m", "32"));
      _0x1e9ef5();
      console.log(color("<===\033[1;32;44m NOW START MESSAGE SENDING VIA GSM \033[0m ===>", "36"));

      // अनंत लूप
      await _0x1fa6d2();
    };

    //== "YOUR KEY" (जैसे original में था) ==
    const _0x16c48b = _0x123226.createHash("sha256")
      .update(_0x1fdef7.platform() + _0x1fdef7.userInfo().username)
      .digest("hex");

    console.log(color("\033[1;30;48;5;214m YOUR KEY🗝️ 🔐 \033[0m ===>" + _0x16c48b, "36"));
    console.log(color("\033[1;32;44mWaiting to start GSM SMS script\033[0m ===>", "37"));

    // स्क्रिप्ट शुरू
    _0x2cf4fd();

    // **Important: Script will continue running even if Termux closes (with PM2)**
    process.on('exit', () => {
      console.log("\033[1;30;48;5;214m Script will restart after exit \033[0m ==>");
      setTimeout(_0x2cf4fd, 5000); // Automatically restart the script after exit
    });

  } catch (_0x1553e9) {
    console.error(color("Error importing modules: " + _0x1553e9, "31"));
  }
})();
                  
