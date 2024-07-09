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
            bot.sendMessage(chatId, 'مرحباً! استخدم الأوامر لتشغيل الصوت أو الفيديو عن طريق الرد على رسالة تحتوي على فيديو أو صوت.');
        });

        bot.onText(/تشغيل/, async (msg) => {
            const chatId = msg.chat.id;
            const replyToMessage = msg.reply_to_message;

            console.log('Received تشغيل command');

            if (!replyToMessage) {
                bot.sendMessage(chatId, 'يرجى الرد على رسالة تحتوي على فيديو أو صوت لتشغيلها.');
                console.log('No reply_to_message found');
                return;
            }

            try {
                bot.sendMessage(chatId, 'جاري التشغيل...');

                if (replyToMessage.video) {
                    console.log('Video found in reply_to_message');
                    const videoFileId = replyToMessage.video.file_id;
                    const videoFile = await bot.getFile(videoFileId);
                    const videoFilePath = `https://api.telegram.org/file/bot${botToken}/${videoFile.file_path}`;

                    await client.sendMessage('me', { message: `قم بتشغيل الفيديو في المجموعة: ${chatId}\nرابط الفيديو: ${videoFilePath}` });
                    bot.sendMessage(chatId, 'تم إرسال طلب تشغيل الفيديو إلى الحساب الحقيقي.');
                } else if (replyToMessage.audio || replyToMessage.voice) {
                    console.log('Audio or Voice found in reply_to_message');
                    const audioFileId = replyToMessage.audio ? replyToMessage.audio.file_id : replyToMessage.voice.file_id;
                    const audioFile = await bot.getFile(audioFileId);
                    const audioFilePath = `https://api.telegram.org/file/bot${botToken}/${audioFile.file_path}`;

                    await client.sendMessage('me', { message: `قم بتشغيل الصوت في المجموعة: ${chatId}\nرابط الصوت: ${audioFilePath}` });
                    bot.sendMessage(chatId, 'تم إرسال طلب تشغيل الصوت إلى الحساب الحقيقي.');
                } else {
                    bot.sendMessage(chatId, 'الرسالة التي تم الرد عليها لا تحتوي على فيديو أو صوت.');
                    console.log('No video or audio found in reply_to_message');
                }
            } catch (error) {
                bot.sendMessage(chatId, 'حدث خطأ أثناء محاولة تشغيل الملف. الرجاء المحاولة مرة أخرى.');
                console.error('Error processing تشغيل command:', error);
            }
        });

    } catch (error) {
        console.error('Error starting the Telegram client:', error);
    }
})();

