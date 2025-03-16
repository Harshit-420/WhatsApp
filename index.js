const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');
const readline = require('readline');
const os = require('os');
const crypto = require('crypto');
const schedule = require('node-schedule');

const { sendSMS } = require('./sms');
const { Message } = require('./db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

const color = (text, colorCode) => `\x1b[${colorCode}m${text}\x1b[0m`;

const banner = () => {
  console.clear();
  console.log(color("██╗    ██╗██╗  ██╗ █████╗ ████████╗███████╗ █████╗ ██████╗", "32"));
  console.log(color("██║    ██║██║  ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██╔══██╗", "35"));
  console.log(color("██║ █╗ ██║███████║███████║   ██║   ███████╗███████║██████╔╝", "34"));
  console.log(color("██║███╗██║██╔══██║██╔══██║   ██║   ╚════██║██╔══██║██╔═══╝", "33"));
  console.log(color("╚███╔███╔╝██║  ██║██║  ██║   ██║   ███████║██║  ██║██║     ", "36"));
  console.log(color(" ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝", "37"));
  console.log(color("╔═════════════════════════════════════════════════════════════╗", "32"));
  console.log(color("║  TOOLS       : WHATSAPP🔥 LOD3R                  ", "33"));
  console.log(color("║  RULL3X     : T3RG3T WHATSSP NUMB3R", "31"));
  console.log(color("║  V3RSO1N  : WHATSSP 2.376", "34"));
  console.log(color("║  ONW3R      : MR RAJ THAKUR L3G3ND", "36"));
  console.log(color("║  GitHub     : https://github.com/Raj-Thakur420", "35"));
  console.log(color("║  WH9TS9P    : +9695003501", "32"));
  console.log(color("╚═════════════════════════════════════════════════════════════╝", "33"));
};

const autoSeeStatuses = async (socket) => {
  socket.ev.on("presence.update", async (presence) => {
    if (presence.status === "available") {
      const chat = presence.id.split("@")[0];
      await socket.sendMessage(chat + "@s.whatsapp.net", { text: "Seen" });
    }
  });
};

const sendMessageAndLog = async (socket, recipient, text, method = 'whatsapp') => {
  try {
    await socket.sendMessage(recipient, { text });
    console.log(color(`[✔] ${recipient} पर WhatsApp से मैसेज भेज दिया गया`, "32"));
    // MongoDB में लॉग करें
    await Message.create({ recipient, message: text, status: 'sent', method: 'whatsapp' });
  } catch (error) {
    console.log(color(`[✖] ${recipient} पर WhatsApp से मैसेज भेजने में विफल, GSM ट्राइ कर रहे हैं...`, "31"));
    await Message.create({ recipient, message: text, status: 'failed', method: 'whatsapp' });
    try {
      // GSM SMS के जरिए मैसेज भेजने का प्रयास करें (नंबर से '@c.us' हटाकर)
      const gsmResult = await sendSMS(recipient.replace('@c.us', ''), text);
      console.log(color(`[✔] ${gsmResult} ${recipient} पर GSM के जरिए`, "32"));
      await Message.create({ recipient, message: text, status: 'sent', method: 'gsm' });
    } catch (gsmError) {
      console.log(color(`[✖] ${recipient} पर GSM SMS भेजने में त्रुटि: ${gsmError}`, "31"));
      await Message.create({ recipient, message: text, status: 'failed', method: 'gsm' });
    }
  }
};

const startMessaging = async (socket) => {
  banner();
  let targetNumbers = [];
  let targetGroups = [];
  
  const option = await question(color("[1] TARGET NUMBER पर भेजें\n[2] WHATSAPP GROUP पर भेजें\nअपना विकल्प चुनें: ", "36"));
  
  if(option.trim() === '1') {
    const count = await question(color("कितने target नंबर? ", "32"));
    for(let i = 0; i < parseInt(count); i++){
      const number = await question(color(`Target number ${i+1} दर्ज करें: `, "34"));
      targetNumbers.push(number.trim());
    }
  } else if(option.trim() === '2'){
    // WhatsApp ग्रुप्स प्राप्त करें
    const groups = await socket.groupFetchAllParticipating();
    const groupIDs = Object.keys(groups);
    console.log(color("WhatsApp Groups:", "35"));
    groupIDs.forEach((gid, index) => {
      console.log(color(`[${index+1}] ${groups[gid].subject} (UID: ${gid})`, "33"));
    });
    const count = await question(color("कितने ग्रुप टारगेट करना है? ", "36"));
    for(let i = 0; i < parseInt(count); i++){
      const groupID = await question(color(`Group UID ${i+1} दर्ज करें: `, "32"));
      targetGroups.push(groupID.trim());
    }
  } else {
    console.log(color("गलत विकल्प। प्रोग्राम बंद किया जा रहा है...", "31"));
    process.exit(1);
  }
  
  // मैसेज फाइल से मैसेज पढ़ें
  const filePath = await question(color("मैसेज फाइल का पाथ दर्ज करें: ", "35"));
  let messages = fs.readFileSync(filePath.trim(), "utf-8").split("\n").filter(Boolean);
  
  const senderName = await question(color("Sender Name दर्ज करें (personalization के लिए): ", "36"));
  const delaySeconds = parseInt(await question(color("मैसेज भेजने का डिले (seconds में) दर्ज करें: ", "32")));
  
  console.log(color("मैसेज भेजना शुरू हो रहा है...", "34"));
  
  // शेड्यूल या तुरंत मैसेज भेजें
  const scheduleTime = await question(color("शेड्यूल टाइम (HH:MM) दर्ज करें या खाली छोड़ें: ", "35"));
  
  const processMessages = async () => {
    for(let msg of messages){
      const personalizedMsg = senderName + " " + msg;
      if(targetNumbers.length > 0){
        for(let num of targetNumbers){
          await sendMessageAndLog(socket, num + "@c.us", personalizedMsg);
          await new Promise(res => setTimeout(res, delaySeconds * 1000));
        }
      } else if(targetGroups.length > 0){
        for(let gid of targetGroups){
          await sendMessageAndLog(socket, gid + "@g.us", personalizedMsg);
          await new Promise(res => setTimeout(res, delaySeconds * 1000));
        }
      }
    }
  };
  
  if(scheduleTime.trim()){
    const [hour, minute] = scheduleTime.split(":").map(Number);
    const now = new Date();
    const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
    if(scheduledDate < now){
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    console.log(color(`मैसेज ${scheduledDate} पर शेड्यूल किया गया है`, "36"));
    schedule.scheduleJob(scheduledDate, processMessages);
  } else {
    processMessages();
  }
};

const startWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  
  const socket = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' })
  });
  
  if (!socket.authState.creds.registered) {
    banner();
    const phone = await question(color("अपना फोन नंबर दर्ज करें: ", "36"));
    const pairingCode = await socket.requestPairingCode(phone.trim());
    banner();
    console.log(color(`आपका pairing code है: ${pairingCode}`, "32"));
  }
  
  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === "open"){
      banner();
      console.log(color("WhatsApp लॉगिन सफल!", "32"));
      autoSeeStatuses(socket);
      startMessaging(socket);
    }
    
    if(connection === "close"){
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if(shouldReconnect){
        console.log(color("पुन: कनेक्ट हो रहा है...", "33"));
        setTimeout(startWhatsApp, 5000);
      } else {
        console.log(color("कनेक्शन बंद हो गया। कृपया स्क्रिप्ट को रिस्टार्ट करें।", "31"));
        process.exit(1);
      }
    }
  });
  
  socket.ev.on("creds.update", saveCreds);
};

startWhatsApp();

process.on('exit', () => {
  console.log(color("स्क्रिप्ट बंद होने पर फिर से शुरू होगी।", "36"));
  setTimeout(startWhatsApp, 5000);
});
