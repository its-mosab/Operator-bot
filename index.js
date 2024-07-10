const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

const botToken = process.env.BOT_TOKEN;
const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const sessionString = process.env.STRING_SESSION;

const bot = new TelegramBot(botToken, { polling: true });
const stringSession = new StringSession(sessionString);

(async () => {
    try {
        const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });

        await client.start();
        console.log('You are now connected.');

        bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            bot.sendMessage(chatId, 'مرحباً! استخدم الأمر "تشغيل" متبوعاً بعنوان الرابط لتشغيله.');
        });

        bot.onText(/تشغيل (.+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const link = match[1];

            console.log('Received تشغيل command with link:', link);

            try {
                bot.sendMessage(chatId, 'جاري التشغيل...');

                await client.sendMessage('me', { message: `قم بتشغيل الرابط في المجموعة: ${chatId}\nالرابط: ${link}` });
                bot.sendMessage(chatId, 'تم إرسال طلب تشغيل الرابط إلى الحساب الحقيقي.');
            } catch (error) {
                bot.sendMessage(chatId, 'حدث خطأ أثناء محاولة تشغيل الرابط. الرجاء المحاولة مرة أخرى.');
                console.error('Error processing تشغيل command:', error);
            }
        });

    } catch (error) {
        console.error('Error starting the Telegram client:', error);
    }
})();
