# WhatsApp + GSM Bulk Messaging System

यह प्रोजेक्ट Node.js आधारित है जो WhatsApp bulk messaging को [Baileys](https://github.com/WhiskeySockets/Baileys) लाइब्रेरी के माध्यम से हैंडल करता है, साथ ही GSM SMS बैकअप, MongoDB लॉगिंग और मैसेज शेड्यूलिंग की सुविधाएँ भी प्रदान करता है।

## सुविधाएँ

- **WhatsApp Bulk Messaging:** व्यक्तिगत नंबर या WhatsApp ग्रुप्स को मैसेज भेजें।
- **GSM SMS बैकअप:** अगर इंटरनेट या WhatsApp डिलीवरी में समस्या आए तो SMS GSM मॉड्यूल (SIM800L/SIM900) के जरिए भेजा जाएगा।
- **MongoDB लॉगिंग:** सभी मैसेज और उनके स्टेटस MongoDB में स्टोर होते हैं। 
- **Auto-Restart:** स्क्रिप्ट स्वचालित रूप से रिस्टार्ट होती है।
- **मैसेज शेड्यूलिंग:** तुरंत या भविष्य में किसी निर्धारित समय पर मैसेज भेजें।

## इंस्टॉलेशन

1. **आवश्यक पैकेज इंस्टॉल करें:**

   ```bash
   pkg update && pkg upgrade
   pkg install nodejs git
   pkg install termux-api
   npm install -g pm2
   npm install
