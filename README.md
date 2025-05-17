# 📊 Voter Turnout Monitor – Diaspora Polling Stations

This project automates the process of extracting voter turnout data from various diaspora polling stations (e.g., Valencia, Gandia) and sends periodic WhatsApp notifications using the Twilio API. The script runs on a schedule and can also be triggered manually via a local Express server.

## 🚀 Features

- ✅ Automatically scrapes data from the official Romanian election website [prezenta.roaep.ro](https://prezenta.roaep.ro).
- 🕒 Scheduled execution at specific times (Europe/Madrid time zone).
- 💬 Sends formatted reports via WhatsApp using Twilio.
- 🌐 Includes a lightweight Express server for manual execution (`GET /execute`).

## ⚙️ Technologies Used

- Node.js
- Puppeteer
- Twilio API
- node-schedule
- Express.js
- dotenv

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/your-user/vote-monitor.git
cd vote-monitor
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root folder with the following content:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_WHATSAPP=whatsapp:+14xxxxxxx
TWILIO_TO_WHATSAPP=whatsapp:+34xxxxxxxxx
```

> Replace the values with your actual Twilio credentials and WhatsApp numbers.

## ▶️ Usage

### Start the script:

```bash
node index.js
```

### Use the Express server:

- Starts automatically at: `http://localhost:3000`
- Trigger the script manually by visiting:

```
http://localhost:3000/execute
```

## ⏱️ Scheduled Jobs

The script is configured to run at specific times defined in the `schedules` array:

```js
const schedules = ['11:44', '15:44', '19:49', '20:00', '20:59', '21:05', '21:10'];
```

You can customize these times (24h format, Europe/Madrid timezone).

## 📬 Example WhatsApp Message

```
17/05/2025, 20:00

SV 880 - Valencia 1 - Total voters: 2,345
SV 881 - Valencia 2 - Total voters: 1,876
...
Total votes: 12,385
```

## 🛠️ Notes

- Ensure Twilio credentials are valid and WhatsApp sandbox setup is complete.
- Designed to run in headless environments (e.g., VPS, cloud functions, Docker).

## 📄 License

This project is open-source. Feel free to modify and adapt it to your needs.
