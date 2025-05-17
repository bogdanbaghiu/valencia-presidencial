require('dotenv').config();
const puppeteer = require('puppeteer');
const twilio = require('twilio');
const schedule = require('node-schedule');
const express = require('express');
const moment = require('moment-timezone');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_FROM_WHATSAPP;
const toWhatsApp = process.env.TWILIO_TO_WHATSAPP;

const client = new twilio(accountSid, authToken);

const electoralColleges = [
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '0', name: 'no data', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '880', name: 'Valencia 1', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13013' },
    { sectie: '881', name: 'Valencia 2', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13014' },
    { sectie: '882', name: 'Valencia 3', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13015' },
    { sectie: '878', name: 'Paterna', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13302' },
    { sectie: '879', name: 'Almussafes', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13303' },
    { sectie: '883', name: 'Xativa', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13209' },
    { sectie: '877', name: 'Gandia', url: 'https://prezenta.roaep.ro/prezidentiale18052025/?presence-abroad-uat=3460&region=abroad&presence-abroad-locality=13214' }
];

const schedules = ['11:44', '15:44', '19:49', '20:00', '20:59', '21:05', '21:10'];

schedules.forEach(hour => {
    const [privateHour, minute] = hour.split(':').map(Number);

    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Europe/Madrid';
    rule.hour = privateHour;
    rule.minute = minute;

    schedule.scheduleJob(rule, async () => {
        console.log(`⏰ Running the code automatically at ${hour} (Europe/Madrid)`);
        await executeCode();
    });
});

async function executeCode() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    let messageOutput = '' + new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }) + '\n\n';
    let totalVotes = 0;


    for (const colegio of electoralColleges) {
        console.log(`Access to: ${colegio.name}`);

        try {
            await page.goto(colegio.url, { waitUntil: 'networkidle0', timeout: 30000 });
            await page.waitForSelector('table');

            const data = await page.evaluate(() => {
                const table = document.querySelector('table');
                const rows = Array.from(table.querySelectorAll('tr'));
                if (rows.length < 2) return [];

                const headers = Array.from(rows[0].querySelectorAll('th, td')).map(th => th.innerText.trim());

                const jsonRows = rows.slice(1).map(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    const rowData = {};
                    cells.forEach((cell, i) => {
                        rowData[headers[i] || `col${i}`] = cell.innerText.trim();
                    });
                    return rowData;
                });

                return jsonRows;
            });

            const totalVotanti = data.length > 0 ? data[0]["Total votanți"] : "0";

            if (parseInt(colegio.sectie) > 0) {
                totalVotes += parseInt(totalVotanti.replace(/\./g, ''));
                messageOutput += `SV ${colegio.sectie} - ${colegio.name} - Total votanti: ${totalVotanti}\n`;
            }

        } catch (err) {
            console.error(`❌ Error en ${colegio.name}:`, err.message);
            messageOutput += `SV ${colegio.sectie} - ${colegio.name} - Error: ${err.message}\n`;
        }
    }
    messageOutput += `\nVoturi totale: ${totalVotes}\n`;

    await browser.close();

    console.log(messageOutput);

    try {
        await client.messages.create({
            from: fromWhatsApp,
            to: toWhatsApp,
            body: messageOutput
        });
        console.log('✅ Message sent by WhatsApp!');
    } catch (error) {
        console.error('❌ Error sending WhatsApp message:', error);
    }
}

// 🌐 Express Server for manual execution
const app = express();
app.use(express.static('public'));
app.use(express.json());

app.get('/execute', async (req, res) => {
    console.log('🖱️ Running the code manually...');
    await executeCode();
    res.send('✅ The code has been executed manually');
});

// 🚀 Start server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
