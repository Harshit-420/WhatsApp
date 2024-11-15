(async () => {
  try {
    const {
      makeWASocket,
      useMultiFileAuthState,
      delay,
      DisconnectReason
    } = await import("@whiskeysockets/baileys");
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

    const askQuestion = (question) => 
      new Promise((resolve) => readline.question(question, resolve));

    const logBanner = () => {
      console.clear();
      console.log(`
        /$$      /$$ /$$   /$$  /$$$$$$  /$$$$$$$$ /$$$$$$   /$$$$$$  /$$$$$$$
        | $$  /$ | $$| $$  | $$ /$$__  $$|__  $$__//$$__  $$ /$$__  $$| $$__  $$
        | $$ /$$$| $$| $$  | $$| $$  \ $$   | $$  | $$  \__/| $$  \ $$| $$  \ $$
        | $$/$$ $$ $$| $$$$$$$$| $$$$$$$$   | $$  |  $$$$$$ | $$$$$$$$| $$$$$$$/
        | $$$$_  $$$$| $$__  $$| $$__  $$   | $$   \____  $$| $$__  $$| $$____/ 
        | $$$/ \  $$$| $$  | $$| $$  | $$   | $$   /$$  \ $$| $$  | $$| $$      
        | $$/   \  $$| $$  | $$| $$  | $$   | $$  |  $$$$$$/| $$  | $$| $$      
        |__/     \__/|__/  |__/|__/  |__/   |__/   \______/ |__/  |__/|__/      
      `);
    };

    let targetNumbers = [];
    let groupIds = [];
    let messageFile = null;
    let messageDelay = null;
    let prefixMessage = null;
    let resumeIndex = 0;

    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    const startMessageLoop = async (sock) => {
      while (true) {
        for (let i = resumeIndex; i < messageFile.length; i++) {
          try {
            const messageTime = new Date().toLocaleTimeString();
            const messageContent = prefixMessage + " " + messageFile[i];

            if (targetNumbers.length > 0) {
              for (const number of targetNumbers) {
                await sock.sendMessage(`${number}@s.whatsapp.net`, { text: messageContent });
                console.log(`Sent to target: ${number}`);
              }
            } else {
              for (const groupId of groupIds) {
                await sock.sendMessage(`${groupId}@g.us`, { text: messageContent });
                console.log(`Sent to group: ${groupId}`);
              }
            }

            console.log(`Time: ${messageTime}, Message: ${messageContent}`);
            await delay(messageDelay * 1000);
          } catch (err) {
            console.error("Error sending message. Retrying...", err.message);
            resumeIndex = i;
            await delay(5000);
          }
        }
        resumeIndex = 0; // Reset index after loop completion
      }
    };

    const startConnection = async () => {
      logBanner();
      const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state
      });

      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
          console.log("WhatsApp Connected!");
          const choice = await askQuestion("1] Send to Target Numbers\n2] Send to WhatsApp Groups\nChoose Option: ");

          if (choice === "1") {
            const numTargets = await askQuestion("Enter number of target numbers: ");
            for (let i = 0; i < numTargets; i++) {
              const target = await askQuestion(`Enter target number ${i + 1}: `);
              targetNumbers.push(target);
            }
          } else if (choice === "2") {
            const groups = await sock.groupFetchAllParticipating();
            const groupIdsList = Object.keys(groups);
            console.log("WhatsApp Groups:");
            groupIdsList.forEach((id, idx) => {
              console.log(`${idx + 1}] ${groups[id].subject} (${id})`);
            });

            const numGroups = await askQuestion("Enter number of groups to target: ");
            for (let i = 0; i < numGroups; i++) {
              const groupId = await askQuestion(`Enter group UID ${i + 1}: `);
              groupIds.push(groupId);
            }
          }

          const messagePath = await askQuestion("Enter message file path: ");
          messageFile = fs.readFileSync(messagePath, "utf-8").split("\n").filter(Boolean);
          prefixMessage = await askQuestion("Enter prefix message: ");
          messageDelay = await askQuestion("Enter message delay (in seconds): ");
          
          console.log("All details filled correctly. Starting message sending...");
          await startMessageLoop(sock);
        }

        if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          console.error("Connection closed. Reconnecting in 5 seconds...");
          setTimeout(startConnection, 5000);
        } else {
          console.error("Connection closed. Please restart the script.");
        }
      });

      sock.ev.on("creds.update", saveCreds);
    };

    await startConnection();
  } catch (error) {
    console.error("Error in script:", error.message);
  }
})();
