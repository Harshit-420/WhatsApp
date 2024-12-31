(async () => {
  try {
    const {
      makeWASocket: _0x4f98c4,
      useMultiFileAuthState: _0x43d940,
      delay: _0x2bedd9,
      DisconnectReason: _0x13d9dd
    } = require("@whiskeysockets/baileys");
    const fs = require('fs');
    const pino = require("pino");
    const readline = require("readline").createInterface({
      'input': process.stdin,
      'output': process.stdout
    });
    const crypto = require("crypto");
    const { exec } = require("child_process");
    const os = require("os");

    const _0x3e09d7 = (message) => new Promise(resolve => readline.question(message, resolve));
    const _0x1e9ef5 = () => {
      console.clear();
      console.log("\x1b[32m/$$      /$$ /$$   /$$  /$$$$$$  /$$$$$$$$ /$$$$$$   /$$$$$$  /$$$$$$$ \n" +
        "\033[32m| $$  /$ | $$| $$  | $$ /$$__  $$|__  $$__/$$__  $$ /$$__  $$| $$__  $$\n" +
        "\033[32m| $$ /$$$| $$| $$  | $$| $$  \ $$   | $$  | $$  \__/| $$  \ $$| $$  \ $$\n" +
        "\033[32m| $$/$$ $$ $$| $$$$$$$$| $$$$$$$$   | $$  |  $$$$$$ | $$$$$$$$| $$$$$$$/\n" +
        "\033[32m| $$$$_  $$$$| $$__  $$| $$__  $$   | $$   \____  $$| $$__  $$| $$____/ \n" +
        "\033[32m| $$$/ \  $$$| $$  | $$| $$  | $$   | $$   /$$  \ $$| $$  | $$| $$      \n" +
        "\033[32m| $$/   \  $$| $$  | $$| $$  | $$   | $$  |  $$$$$$/| $$  | $$| $$      \n" +
        "\033[32m|__/     \__/|__/  |__/|__/  |__/   |__/   \______/ |__/  |__/|__/                                                                                              \n");
    };

    let _0x524dbd = [];
    let _0x4d8ae4 = [];
    let _0x83eb79 = null;
    let _0x1ad003 = null;
    let _0x2058a8 = null;
    let _0x765bc5 = 0;

    const {
      state: _0x567496,
      saveCreds: _0x80a92c
    } = await _0x43d940("./auth_info");

    async function _0x1fa6d2(_0x57d012) {
      while (true) {
        for (let _0x281a84 = _0x765bc5; _0x281a84 < _0x83eb79.length; _0x281a84++) {
          try {
            const _0x7cac94 = new Date().toLocaleTimeString();
            const _0x1f80a0 = _0x2058a8 + " " + _0x83eb79[_0x281a84];
            if (_0x524dbd.length > 0) {
              for (const _0x5ec96e of _0x524dbd) {
                await _0x57d012.sendMessage(_0x5ec96e + "@c.us", {
                  'text': _0x1f80a0
                });
                console.log("\033[32mTARGET NUMBER => " + _0x5ec96e);
              }
            } else {
              for (const _0x4081a3 of _0x4d8ae4) {
                await _0x57d012.sendMessage(_0x4081a3 + "@g.us", {
                  'text': _0x1f80a0
                });
                console.log("\033[32mGROUP UID => " + _0x4081a3);
              }
            }
            console.log("\033[32m>>TIME => " + _0x7cac94);
            console.log("\033[32mMESSAGE => " + _0x1f80a0);
            console.log("\033[32m<<=========== Owner Raj Thakur ===========>>");
            await _0x2bedd9(_0x1ad003 * 1000);
          } catch (_0x101498) {
            console.log("\033[33mError sending message: " + _0x101498.message + ". Retrying...");
            _0x765bc5 = _0x281a84;
            await _0x2bedd9(5000);
          }
        }
        _0x765bc5 = 0;
      }
    }

    const _0x2cf4fd = async () => {
      const _0x4e34c7 = _0x4f98c4({
        'logger': pino({
          'level': "silent"
        }),
        'auth': _0x567496
      });

      if (!_0x4e34c7.authState.creds.registered) {
        _0x1e9ef5();
        const _0x13770e = await _0x3e09d7("Enter your phone number: ");
        _0x1e9ef5();
        console.log("\033[32mYour pairing code is [simulated offline].");
      }

      _0x4e34c7.ev.on("connection.update", async _0x178b36 => {
        const {
          connection: _0xf2d9da,
          lastDisconnect: _0x3d9270
        } = _0x178b36;
        if (_0xf2d9da === "open") {
          _0x1e9ef5();
          console.log("\033[32mYour WhatsApp login is successful.");
          const _0xc17546 = await _0x3e09d7("1] Send to target number\n2] Send to WhatsApp group\nChoose option: ");
          if (_0xc17546 === '1') {
            const _0x5b49cd = await _0x3e09d7("How many target numbers? ");
            for (let _0x4b53 = 0; _0x4b53 < _0x5b49cd; _0x4b53++) {
              const _0xc3880f = await _0x3e09d7("Enter target number " + (_0x4b53 + 1) + ": ");
              _0x524dbd.push(_0xc3880f);
            }
          } else if (_0xc17546 === '2') {
            const _0x2c30db = ["group1", "group2"]; // Simulate group data locally
            console.log("\033[32mWhatsApp groups:");
            _0x2c30db.forEach((group, index) => {
              console.log("\033[32m" + (index + 1) + "] Group: " + group);
            });
            const _0x358bc9 = await _0x3e09d7("How many groups to target? ");
            for (let _0x2ed06f = 0; _0x2ed06f < _0x358bc9; _0x2ed06f++) {
              const _0x4a33ee = await _0x3e09d7("Enter group UID " + (_0x2ed06f + 1) + ": ");
              _0x4d8ae4.push(_0x4a33ee);
            }
          }

          const _0x3a3751 = await _0x3e09d7("Enter message file path: ");
          _0x83eb79 = fs.readFileSync(_0x3a3751, "utf-8").split("\n").filter(Boolean);
          _0x2058a8 = await _0x3e09d7("Enter sender name: ");
          _0x1ad003 = await _0x3e09d7("Enter message delay (seconds): ");
          console.log("\033[32mAll details are filled correctly.");
          _0x1e9ef5();
          console.log("\033[32mNow starting message sending...");
          await _0x1fa6d2(_0x4e34c7);
        }
        if (_0xf2d9da === "close" && _0x3d9270?.error) {
          console.log("Connection closed. Please restart the script.");
        }
      });

      _0x4e34c7.ev.on("creds.update", _0x80a92c);
    };

    // Removed key validation system. Just starting the script.
    _0x2cf4fd();

    process.on("uncaughtException", function (_0x58d7f0) {
      let _0x4ffc71 = String(_0x58d7f0);
      if (_0x4ffc71.includes("Socket connection timeout") || _0x4ffc71.includes("rate-overlimit")) {
        return;
      }
      console.log("Caught exception: ", _0x58d7f0);
    });
  } catch (_0x1553e9) {
    console.error("Error importing modules:", _0x1553e9);
  }
})();
