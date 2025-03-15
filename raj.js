(async () => {
  try {
    // ---- Imported Modules ----
    const { makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = await import("@whiskeysockets/baileys");
    const fs = await import('fs');
    const pino = (await import("pino")).default;
    const readline = (await import("readline")).createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const axios = await import("axios");
    const os = await import('os');
    const crypto = await import("crypto");
    const { spawn } = await import("child_process");

    // ---- Helper: Promisified Question ----
    const question = (_msg) => new Promise(resolve => readline.question(_msg, resolve));

    // ---- Color Function for Easy Styling ----
    const color = (text, colorCode) => `\x1b[${colorCode}m${text}\x1b[0m`;

    // ---- Animated Print Function (per character) ----
    async function animatedPrint(text, delayTime = 5) {
      for (const char of text) {
        process.stdout.write(char);
        await new Promise(resolve => setTimeout(resolve, delayTime));
      }
      process.stdout.write("\n");
    }

    // ---- Loader Function: Display ASCII Logo & Bio Details ----
    async function showLoader() {
      console.clear();
      // ASCII Logo (similar to Facebook script)
      const logoLines = [
        " _______  _______  _______  _       _________ _        _______   ",
        "(  ___  )(  ____ \\(  ____ \\( \\      \\__   __/( (    /|(  ____ \\  ",
        "| (   ) || (    \\/| (    \\/| (         ) (   |  \\  ( || (    \\/  ",
        "| |   | || (__    | (__    | |         | |   |   \\ | || (__       ",
        "| |   | ||  __)   |  __)   | |         | |   | (\\ \\) ||  __)      ",
        "| |   | || (      | (      | |         | |   | | \\   || (         ",
        "| (___) || )      | )      | (____/\\___) (___| )  \\  || (____/\\   ",
        "(_______)|/       |/       (_______/\\_______/|/    )_)(_______/   "
      ];
      for (let line of logoLines) {
        await animatedPrint(color(line, "32"), 5);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Custom Bio (first part)
      const bio1 = [
        "╭──────────────────────────── < DETAILS >─────────────────────────────────╮",
        "│ [=] CODER BOY 👨‍💻💡==> RAJ⌛THAKUR ⚔️ BEINGS BOY🚀 GAWAR THAKUR          │",
        "│ [=] RULEX BOY 🖥️🚀 ==> NADEEM  RAHUL SHUBHAM                              │",
        "│ [=] MY LOVE [<❤️=]    ==> ASHIQI PATHAN                                   │",
        "│ [=] VERSION  🔢📊    ==> 420.786.36                                      │",
        "│ [=] INSTAGRAM 📸    ==> CONVO OFFLINE                                    │",
        "│ [=] YOUTUBE   🎥📡  ==> https://www.youtube.com/@raj-thakur18911         │",
        "│ [=] SCRIPT CODING    ==> 🐍🔧 Python🖥️🖱️ Bash🌐🖥️ PHP                       │",
        "╰──────────────────────────────────────────────────────────────────────────╯",
        "╭──────────────────────────── < YOUR INFO >──────────────────────────────╮",
        "│ [=] Script Writer ⌛=====>    1:54 AM                                   │",
        "│ [=] Script Author 🚀 =====>   26/January/2025                           │",
        "╰─────────────────────────────────────────────────────────────────────────╯",
        "╭──────────────────────────── < COUNTRY ~  >─────────────────────────────╮",
        "│ 【•】 Your Country ==> India 🔥                                         │",
        "│ 【•】 Your Region   ==> Bajrang Dal Ayodhya                             │",
        "│ 【•】 Your City  ==> Uttar Pradesh                                      │",
        "╰─────────────────────────────────────────────────────────────────────────╯",
        "╭──────────────────────────── < NOTE >───────────────────────────────────╮",
        "│                     Tool Paid Monthly ₹150                              │",
        "│                     Tool Paid 1 Year ₹500                               │",
        "╰─────────────────────────────────────────────────────────────────────────╯"
      ];
      for (let line of bio1) {
        await animatedPrint(color(line, "36"), 3);
      }
      
      // Secondary Bio (optional second part)
      const bio2 = [
        "╭──────────────────────────── < DETAILS >─────────────────────────────────╮",
        "│  [=] 👨‍💻 DEVELOPER     : 🚀RAJ ⚔️THAKUR [+] GAWAR ⚔️THAKUR               │",
        "│  [=] 🛠️ TOOLS NAME       : OFFLINE TERMUX                                │",
        "│  [=] 🔥 RULL3X          : UP FIRE RUL3X                                 │",
        "│  [=] 🏷️ BR9ND            : MR D R9J  H3R3                                │",
        "│  [=] 🐱 GitHub          : https://github.com/Raj-Thakur420              │",
        "│  [=] 🤝 BROTHER         : NADEEM SHUBHAM RAHUL                          │",
        "│  [=] 🔧 TOOLS           : FREE NO PAID, CHANDU BIKHARI HAI, USKA PAID LO│",
        "│  [=] 📞 WH9TS9P         : +994 405322645                                │",
        "╰─────────────────────────────────────────────────────────────────────────╯"
      ];
      for (let line of bio2) {
        await animatedPrint(color(line, "35"), 3);
      }
      
      // Pause briefly before continuing
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // ---- Offline Queue Functions (Using JSON File) ----
    const offlineQueueFile = "./offline_queue.json";
    async function readOfflineQueue() {
      try {
        if (!fs.existsSync(offlineQueueFile)) {
          await fs.promises.writeFile(offlineQueueFile, JSON.stringify([]));
        }
        const data = await fs.promises.readFile(offlineQueueFile, "utf-8");
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    async function writeOfflineQueue(queue) {
      try {
        await fs.promises.writeFile(offlineQueueFile, JSON.stringify(queue, null, 2));
      } catch (e) {
        console.error(color("Error writing offline queue: " + e, "31"));
      }
    }
    async function addToQueue(target, message) {
      let queue = await readOfflineQueue();
      queue.push({ target, message, timestamp: new Date().toISOString() });
      await writeOfflineQueue(queue);
      console.log(color("[OFFLINE] Message queued due to connectivity issues.", "31"));
    }

    // ---- Connectivity Check using Axios ----
    async function isConnected() {
      try {
        await axios.get('https://www.google.com', { timeout: 5000 });
        return true;
      } catch (e) {
        return false;
      }
    }

    // ---- Offline Logo Display (when offline) with WhatsApp Logo ----
    function offlineLogo() {
      // Offline Mode Logo
      console.log(color("██████╗  ██████╗ ██╗  ██╗", "31"));
      console.log(color("██╔══██╗██╔═══██╗██║ ██╔╝", "31"));
      console.log(color("██████╔╝██║   ██║█████╔╝ ", "31"));
      console.log(color("██╔═══╝ ██║   ██║██╔═██╗ ", "31"));
      console.log(color("██║     ╚██████╔╝██║  ██╗", "31"));
      console.log(color("╚═╝      ╚═════╝ ╚═╝  ╚═╝", "31"));
      console.log(color("       OFFLINE MODE ACTIVE", "31"));
      
      // WhatsApp Logo (printed below offline logo in same green as Facebook script)
      console.log(color(" __          __  _                            _          _ ", "32"));
      console.log(color(" \\ \\        / / | |                          | |        | |", "32"));
      console.log(color("  \\ \\  /\\  / /__| | ___ ___  _ __ ___   ___  | |_ ___   | |", "32"));
      console.log(color("   \\ \\/  \\/ / _ \\ |/ __/ _ \\| '_ ` _ \\ / _ \\ | __/ _ \\  | |", "32"));
      console.log(color("    \\  /\\  /  __/ | (_| (_) | | | | | |  __/ | || (_) | |_|", "32"));
      console.log(color("     \\/  \\/ \\___|_|\\___\\___/|_| |_| |_|\\___|  \\__\\___/  (_)", "32"));
      console.log(color("              WHATSAPP", "32"));
    }

    // ---- Process Offline Queue Periodically ----
    async function processOfflineQueue(socket) {
      setInterval(async () => {
        if (await isConnected()) {
          let queue = await readOfflineQueue();
          if (queue.length > 0) {
            console.log(color("[OFFLINE QUEUE] Attempting to send queued messages...", "32"));
            for (let i = 0; i < queue.length; i++) {
              let item = queue[i];
              try {
                let targetID = item.target.includes("@") ? item.target : item.target + "@c.us";
                await socket.sendMessage(targetID, { text: item.message });
                console.log(color(`[OFFLINE QUEUE] Sent message to ${item.target}`, "32"));
                queue.splice(i, 1);
                i--;
              } catch (e) {
                console.error(color(`[OFFLINE QUEUE] Failed to send message to ${item.target}`, "31"));
              }
            }
            await writeOfflineQueue(queue);
          }
        }
      }, 15000);
    }

    // ---- Daemon (Termux Exit) Mode Support ----
    if (!process.env.DAEMON) {
      await showLoader(); // Show fancy loader details at start
      let daemonChoice = await question(color("[?] Daemonize script (run in background even after Termux exit)? (y/n): ", "36"));
      if (daemonChoice.trim().toLowerCase() === 'y') {
        const { spawn } = await import("child_process");
        spawn(process.argv[0], process.argv.slice(1), {
          detached: true,
          stdio: 'ignore',
          env: { ...process.env, DAEMON: "true" }
        }).unref();
        process.exit(0);
      }
    }

    // ---- Auth & Socket Initialization ----
    const { state: authState, saveCreds } = await useMultiFileAuthState("./auth_info");
    const socket = makeWASocket({
      logger: pino({ level: "silent" }),
      auth: authState
    });

    // ---- Auto-See Statuses (unchanged) ----
    const autoSeeStatuses = async (socket) => {
      socket.ev.on("presence.update", async (presence) => {
        if (presence.status === "available") {
          const chat = presence.id.split("@")[0];
          await socket.sendMessage(chat + "@s.whatsapp.net", { text: "Seen" });
        }
      });
    };

    // ---- Modified Message Sending Loop with Offline & Queue Support ----
    async function sendMessagesLoop(socket) {
      while (true) {
        for (let i = 0; i < messages.length; i++) {
          try {
            const currentTime = new Date().toLocaleTimeString();
            const fullMessage = haterName + " " + messages[i];
            if (!(await isConnected())) {
              offlineLogo();
              if (targetNumbers.length > 0) {
                for (const num of targetNumbers) {
                  await addToQueue(num, fullMessage);
                }
              } else {
                for (const group of targetGroups) {
                  await addToQueue(group, fullMessage);
                }
              }
              console.log(color("[OFFLINE] Connectivity lost. Message queued.", "31"));
              await delay(5000);
              continue;
            }
            if (targetNumbers.length > 0) {
              for (const num of targetNumbers) {
                await socket.sendMessage(num + "@c.us", { text: fullMessage });
                console.log(color(`[TARGET NUMBER] ===> ${num}`, "32"));
              }
            } else {
              for (const group of targetGroups) {
                await socket.sendMessage(group + "@g.us", { text: fullMessage });
                console.log(color(`[GROUP UID] ===> ${group}`, "33"));
              }
            }
            console.log(color(`[TIME⌛] ===> ${currentTime}`, "34"));
            console.log(color(`[MESSAGE📥] ===> ${fullMessage}`, "35"));
            console.log(color("[OWNER] <<===========•OWNER ⚔️ 👑RAJ⚔️THAKUR 👑⭐ ===========>", "37"));
            await delay(messageDelay * 1000);
          } catch (err) {
            await delay(5000);
          }
        }
      }
    }

    // ---- Setup Connection Update & Login Flow ----
    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        console.clear();
        console.log(color("[WHATSAPP] Login successful!", "32"));
        processOfflineQueue(socket);
        autoSeeStatuses(socket);

        // ---- Choose Target Option ----
        const option = await question(color("[1] SEND TO TARGET NUMBER\n[2] SEND TO WHATSAPP GROUP\nChoose Option ===> ", "36"));
        if (option.trim() === '1') {
          const count = await question(color("[+] HOW MANY TARGET NUMBERS? ===> ", "32"));
          for (let i = 0; i < parseInt(count); i++) {
            const num = await question(color(`[+] ENTER TARGET NUMBER ${i + 1} ===> `, "34"));
            targetNumbers.push(num.trim());
          }
        } else if (option.trim() === '2') {
          const groups = await socket.groupFetchAllParticipating();
          const groupIDs = Object.keys(groups);
          console.log(color("[GROUP LIST] ===>", "33"));
          groupIDs.forEach((grp, idx) => {
            console.log(color(`[${idx + 1}] GROUP: ${groups[grp].subject} | UID: ${grp}`, "34"));
          });
          const groupCount = await question(color("[+] HOW MANY GROUPS TO TARGET? ===> ", "35"));
          for (let i = 0; i < parseInt(groupCount); i++) {
            const grp = await question(color(`[+] ENTER GROUP UID ${i + 1} ===> `, "36"));
            targetGroups.push(grp.trim());
          }
        }
        // Read message file and hater name
        const msgFilePath = await question(color("[+] ENTER MESSAGE FILE PATH ===> ", "37"));
        messages = fs.readFileSync(msgFilePath, "utf-8").split("\n").filter(Boolean);
        haterName = await question(color("[+] ENTER HATER NAME ===> ", "32"));
        messageDelay = parseInt(await question(color("[+] ENTER MESSAGE DELAY (in seconds) ===> ", "34")));
        console.log(color("[WHATSAPP] All details filled. Starting message sending...", "36"));
        sendMessagesLoop(socket);
      }
      if (connection === "close" && lastDisconnect?.error) {
        const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          setTimeout(() => { socket.ws.close(); }, 5000);
        } else {
          console.log(color("Connection closed. Please restart the script.", "31"));
        }
      }
    });

    // Save credentials on updates
    socket.ev.on("creds.update", saveCreds);

    // ---- Global Variables for Message Targets & Settings ----
    let targetNumbers = [];
    let targetGroups = [];
    let messages = [];
    let haterName = "";
    let messageDelay = 0;

    // ---- Removed Unique Key & "Waiting for login..." ----
    // (These lines have been removed as per user request.)

  } catch (err) {
    console.error(color("Error importing modules: " + err, "31"));
  }
})();
