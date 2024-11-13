(async () => {
  const runScript = async () => {
    try {
      // Importing necessary modules
      const { makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = await import("@whiskeysockets/baileys");
      const fs = await import('fs');
      const pino = (await import("pino")).default;
      const readline = (await import("readline")).createInterface({
        input: process.stdin,
        output: process.stdout
      });
      const axios = (await import("axios")).default;
      const os = await import('os');
      const crypto = await import("crypto");
      const { exec } = await import("child_process");

      const prompt = (message) => new Promise(resolve => readline.question(message, resolve));
      const showBanner = () => {
        console.clear();
        console.log("BANNER HERE"); // replace with your banner text
      };

      let targetNumbers = [];
      let groupUids = [];
      let messageContent = null;
      let delayTime = null;
      let messagePrefix = null;
      let messageIndex = 0;

      const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

      const sendMessageLoop = async (socket) => {
        while (true) {
          for (let i = messageIndex; i < messageContent.length; i++) {
            try {
              const time = new Date().toLocaleTimeString();
              const message = messagePrefix + " " + messageContent[i];

              if (targetNumbers.length > 0) {
                for (const number of targetNumbers) {
                  await socket.sendMessage(number + "@c.us", { text: message });
                  console.log("TARGET NUMBER => " + number);
                }
              } else {
                for (const group of groupUids) {
                  await socket.sendMessage(group + "@g.us", { text: message });
                  console.log("GROUP UID => " + group);
                }
              }
              console.log("TIME => " + time);
              console.log("MESSAGE=> " + message);

              await delay(delayTime * 1000); // delay in seconds
            } catch (err) {
              console.error("Error sending message: " + err.message + ". Retrying...");
              messageIndex = i;
              await delay(5000); // Retry delay
            }
          }
          messageIndex = 0;
        }
      };

      const setupSocket = async () => {
        const socket = makeWASocket({ logger: pino({ level: "silent" }), auth: state });

        socket.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
          if (connection === "open") {
            showBanner();
            console.log("WhatsApp Connected");

            // Additional setup after connection
            const option = await prompt("1) Send to Number\n2) Send to Group\nChoose: ");
            if (option === '1') {
              const targetCount = await prompt("Number of target numbers: ");
              for (let i = 0; i < targetCount; i++) {
                const target = await prompt(`Enter target number ${i + 1}: `);
                targetNumbers.push(target);
              }
            } else if (option === '2') {
              const groups = await socket.groupFetchAllParticipating();
              const groupKeys = Object.keys(groups);
              console.log("WhatsApp Groups:");
              groupKeys.forEach((group, index) => {
                console.log(`${index + 1}) ${groups[group].subject} - UID: ${group}`);
              });
              const groupCount = await prompt("Number of groups to target: ");
              for (let i = 0; i < groupCount; i++) {
                const groupUid = await prompt(`Enter group UID ${i + 1}: `);
                groupUids.push(groupUid);
              }
            }

            const messageFilePath = await prompt("Enter message file path: ");
            messageContent = fs.readFileSync(messageFilePath, "utf-8").split("\n").filter(Boolean);
            messagePrefix = await prompt("Enter message prefix: ");
            delayTime = await prompt("Enter message delay (seconds): ");

            console.log("Setup complete. Starting message loop...");
            await sendMessageLoop(socket);
          } else if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
              console.log("Disconnected. Reconnecting in 5 seconds...");
              setTimeout(setupSocket, 5000);
            } else {
              console.log("Logged out. Please restart the script.");
            }
          }
        });

        socket.ev.on("creds.update", saveCreds);
      };

      // Start the socket setup
      await setupSocket();
    } catch (err) {
      console.error("Unexpected error:", err);
      console.log("Retrying in 5 seconds...");
      setTimeout(runScript, 5000);
    }
  };

  // Start the main loop to ensure continuous operation
  await runScript();
})();
