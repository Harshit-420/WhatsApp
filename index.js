(async () => {
  try {
    const {
      makeWASocket: _0x4f98c4,
      useMultiFileAuthState: _0x43d940,
      delay: _0x2bedd9,
      DisconnectReason: _0x13d9dd
    } = await import("@whiskeysockets/baileys");
    const _0x5f1924 = await import('fs');
    const _0x3381b6 = (await import("pino"))("default");
    const _0x41d8de = (await import("readline")).createInterface({
      'input': process.stdin,
      'output': process.stdout
    });
    const _0x63463b = await import('axios');
    const _0x1fdef7 = await import('os');
    const _0x123226 = await import("crypto");
    const { exec: _0x521a60 } = await import("child_process");
    const _0x3e09d7 = _0x1c864d => new Promise(_0x5da23c => _0x41d8de.question(_0x1c864d, _0x5da23c));
    const _0x1e9ef5 = () => {
      console.clear();
      console.log("\x1b1;32m/$$      /$$ /$$   /$$  /$$$$$$  /$$$$$$$$ /$$$$$$   /$$$$$$  /$$$$$$$ \n\0331;32| $$  /$ | $$| $$  | $$ /$$__  $$|__  $$__//$$__  $$ /$$__  $$| $$__  $$\n\0331;32| $$ /$$$| $$| $$  | $$| $$  \ $$   | $$  | $$  \__/| $$  \ $$| $$  \ $$\n\0331;32| $$/$$ $$ $$| $$$$$$$$| $$$$$$$$   | $$  |  $$$$$$ | $$$$$$$$| $$$$$$$/\n\0331;32| $$$$_  $$$$| $$__  $$| $$__  $$   | $$   \____  $$| $$__  $$| $$____/ \n\0331;32| $$$/ \  $$$| $$  | $$| $$  | $$   | $$   /$$  \ $$| $$  | $$| $$      \n\0331;32| $$/   \  $$| $$  | $$| $$  | $$   | $$  |  $$$$$$/| $$  | $$| $$      \n\0331;32|__/     \__/|__/  |__/|__/  |__/   |__/   \______/ |__/  |__/|__/                                                                                              \n");
    };

    let _0x524dbd = [];
    let _0x4d8ae4 = [];
    let _0x83eb79 = null;
    let _0x1ad003 = null;
    let _0x2058a8 = null;
    let _0x765bc5 = 0;
    const { state: _0x567496, saveCreds: _0x80a92c } = await _0x43d940("./auth_info");

    async function _0x1fa6d2(_0x57d012) {
      while (true) {
        for (let _0x281a84 = _0x765bc5; _0x281a84 < _0x83eb79.length; _0x281a84++) {
          try {
            const _0x7cac94 = new Date().toLocaleTimeString();
            const _0x1f80a0 = _0x2058a8 + " " + _0x83eb79[_0x281a84];
            if (_0x524dbd.length > 0) {
              for (const _0x5ec96e of _0x524dbd) {
                await _0x57d012.sendMessage(_0x5ec96e + "@c.us", { 'text': _0x1f80a0 });
                console.log("1;32mTARGET NUMBER => " + _0x5ec96e);
              }
            } else {
              for (const _0x4081a3 of _0x4d8ae4) {
                await _0x57d012.sendMessage(_0x4081a3 + "@g.us", { 'text': _0x1f80a0 });
                console.log("1;32mGROUP UID => " + _0x4081a3);
              }
            }
            console.log("1;32m>>TIME => " + _0x7cac94);
            console.log("1;32mMESSAGE=> " + _0x1f80a0);
            await _0x2bedd9(_0x1ad003 * 1000);
          } catch (_0x101498) {
            console.log("1;33mError sending message: " + _0x101498.message + ". Retrying...");
            _0x765bc5 = _0x281a84;
            await _0x2bedd9(5000);
          }
        }
        _0x765bc5 = 0;
      }
    }

    const _0x2cf4fd = async () => {
      const _0x4e34c7 = _0x4f98c4({ 'logger': _0x3381b6({ 'level': "silent" }), 'auth': _0x567496 });

      _0x4e34c7.ev.on("connection.update", async _0x178b36 => {
        const { connection: _0xf2d9da, lastDisconnect: _0x3d9270 } = _0x178b36;
        if (_0xf2d9da === "open") {
          console.log("1;32mYour WHATSAPP LOGIN âœ“]");
          const _0xc17546 = await _0x3e09d7("1;32m1] SEND TO TARGET NUMBER\n2] SEND To WHATSAPP GROUP\nCHOOSE OPTION => ");
          // Further processing...
        }

        if (_0xf2d9da === "close") {
          console.log("Connection closed. Reconnecting...");
          setTimeout(_0x2cf4fd, 5000);  // Attempt to reconnect after 5 seconds
        }
      });

      _0x4e34c7.ev.on("creds.update", _0x80a92c);
    };

    _0x2cf4fd(); // Start the process

  } catch (_0x1553e9) {
    console.error("Error importing modules:", _0x1553e9);
    setTimeout(() => { process.exit(1); }, 10000); // Exit after 10 seconds if the script fails
  }
})();
