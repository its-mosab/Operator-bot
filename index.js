const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');

// رمز الوصول للبوت
const token = '6590732454:AAH5AM2uceYDaV-EU-lAJD1BXjOkYV6J9XM';
const bot = new TelegramBot(token, { polling: true });

// معرّف الحساب المساعد
const assistantId = '6521251646';

// الاستجابة للأوامر
bot.onText(/تشغيل (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  bot.sendMessage(chatId, `تشغيل الصوت: ${query}`);
  // استدعاء وظيفة لتشغيل الصوت عبر الحساب المساعد
  await playMedia('audio', query);
});

bot.onText(/فيديو (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];
  bot.sendMessage(chatId, `تشغيل الفيديو: ${query}`);
  // استدعاء وظيفة لتشغيل الفيديو عبر الحساب المساعد
  await playMedia('video', query);
});

bot.onText(/المطور/, (msg) => {
  bot.sendMessage(msg.chat.id, "مطور البوت هو: YOUR_NAME");
});

// وظيفة لتشغيل الصوت أو الفيديو باستخدام الحساب المساعد
async function playMedia(type, query) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // تسجيل الدخول للحساب المساعد
  await page.goto('https://web.telegram.org');

  // إدخال رقم الهاتف
  await page.waitForSelector('input[type="tel"]');
  await page.type('input[type="tel"]', 'YOUR_PHONE_NUMBER');
  await page.click('button[type="submit"]');

  // انتظار رمز التحقق
  await page.waitForSelector('input[type="text"]');
  const code = await getCodeFromUser(); // افترض أن هذه الوظيفة تستدعي المستخدم لإدخال الرمز
  await page.type('input[type="text"]', code);
  await page.click('button[type="submit"]');

  // تشغيل الوسائط (الصوت أو الفيديو)
  const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
  await page.goto(searchUrl);
  const videoLink = await page.evaluate(() => {
    const firstVideo = document.querySelector('a#video-title');
    return firstVideo ? firstVideo.href : null;
  });

  if (videoLink) {
    await page.goto(videoLink);
    if (type === 'audio') {
      // تشغيل الصوت (يمكنك استخدام YouTube في الوضع الخلفي)
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) video.play();
      });
    } else if (type === 'video') {
      // تشغيل الفيديو
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) video.play();
      });
    }
  }

  // يمكنك إضافة منطق إضافي للتحكم في الوسائط هنا

  // الانتظار لفترة للسماح بتشغيل الوسائط (يمكنك تحسين هذا الجزء)
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
}

// وظيفة للحصول على رمز التحقق من المستخدم (يجب عليك تنفيذ هذه الوظيفة بنفسك)
async function getCodeFromUser() {
  // مثال بسيط: يمكنك استبداله بمنطق آخر للحصول على الرمز من المستخدم
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('أدخل رمز التحقق: ', (code) => {
      readline.close();
      resolve(code);
    });
  });
}
