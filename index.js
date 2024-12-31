(async () => {
  try {
    const { makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = await import("@whiskeysockets/baileys");
    const fs = await import('fs');
    const pino = (await import("pino")).default;
    const readline = (await import("readline")).createInterface({
      'input': process.stdin,
      'output': process.stdout
    });
    const axios = (await import("axios")).default;
    const os = await import('os');
    const crypto = await import("crypto");
    const { exec } = await import("child_process");

    const question = (query) => new Promise((resolve) => readline.question(query, resolve));

    const clearConsole = () => {
      console.clear();
      console.log("\x1b[32m/$$      /$$ /$$   /$$  /$$$$$$  /$$$$$$$$ /$$$$$$   /$$$$$$  /$$$$$$$ \n\
      | $$  /$ | $$| $$  | $$ /$$__  $$|__  $$__//$$__  $$ /$$__  $$| $$__  $$\n\
      | $$ /$$$| $$| $$  | $$| $$  \ $$   | $$  | $$  \__/| $$  \ $$| $$  \ $$\n\
      | $$/$$ $$ $$| $$$$$$$$| $$$$$$$$   | $$  |  $$$$$$ | $$$$$$$$| $$$$$$$/\n\
      | $$$$_  $$$$| $$__  $$| $$__  $$   | $$   \____  $$| $$__  $$| $$____/ \n\
      | $$$/ \  $$$| $$  | $$| $$  | $$   | $$   /$$  \ $$| $$  | $$| $$      \n\
      | $$/   \  $$| $$  | $$| $$  | $$   | $$  |  $$$$$$/| $$  | $$| $$      \n\
      |__/     \__/|__/  |__/|__/  |__/   |__/   \______/ |__/  |__/|__/ \n\
      \033[31mTOOLS      : WHATSAPP LOADER\n\
      \033[32mRULL3X     : UP FIRE RUL3X\n\
      \033[34mBR9ND      : MR D R9J H3R3\n\
      \033[37mGitHub     : https://github.com/Raj-Thakur420\n\
      \033[32mWH9TS9P    : +994 405322645");
    };

    let targetNumbers = [];
    let groupIds = [];
    let messages = null;
    let senderName = null;
    let messageDelay = 0;
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    async function sendMessage(_0x57d012) {
      while (true) {
        for (let index = 0; index < messages.length; index++) {
          try {
            const currentTime = new Date().toLocaleTimeString();
            const messageContent = senderName + " " + messages[index];

            if (targetNumbers.length > 0) {
              for (const number of targetNumbers) {
                await _0x57d012.sendMessage(number + "@c.us", { text: messageContent });
                console.log(`Target Number => ${number}`);
              }
            } else {
              for (const groupId of groupIds) {
                await _0x57d012.sendMessage(groupId + "@g.us", { text: messageContent });
                console.log(`Group UID => ${groupId}`);
              }
            }
            console.log(`>>TIME => ${currentTime}`);
            console.log(`MESSAGE => ${messageContent}`);
            console.log("<<=========== OWNER RAJ THAKUR =========>>");

            await delay(messageDelay * 1000);
          } catch (error) {
            console.log(`Error sending message: ${error.message}. Retrying...`);
            await delay(5000);
          }
        }
      }
    }

    const setupSocket = async () => {
      const socket = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state
      });

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          clearConsole();
          console.log("Your WhatsApp login successful!");

          const choice = await question("1] Send to target number\n2] Send to WhatsApp group\nChoose option: ");
          if (choice === '1') {
            const targetCount = await question("How many target numbers? ");
            for (let i = 0; i < targetCount; i++) {
              const targetNumber = await question(`Enter target number ${i + 1}: `);
              targetNumbers.push(targetNumber);
            }
          } else if (choice === '2') {
            const groups = await socket.groupFetchAllParticipating();
            const groupIdsArray = Object.keys(groups);
            console.log("Whatsapp Groups:");
            groupIdsArray.forEach((groupId, idx) => {
              console.log(`${idx + 1}] Group Name: ${groups[groupId].subject} UID: ${groupId}`);
            });
            const groupCount = await question("How many groups to target? ");
            for (let i = 0; i < groupCount; i++) {
              const groupId = await question(`Enter group UID ${i + 1}: `);
              groupIds.push(groupId);
            }
          }

          const filePath = await question("Enter message file path: ");
          messages = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
          senderName = await question("Enter sender name: ");
          messageDelay = parseInt(await question("Enter message delay in seconds: "));

          console.log("Details filled correctly. Starting message sending...");
          await sendMessage(socket);
        }

        if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          console.log("Network issue, retrying...");
          setTimeout(setupSocket, 5000);
        } else {
          console.log("Connection closed. Please restart the script.");
        }
      });

      socket.ev.on("creds.update", saveCreds);
    };

    setupSocket();
  } catch (error) {
    console.error("Error importing modules:", error);
  }
})();
