const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // تسجيل الدخول للحساب المساعد
  await page.goto('https://web.telegram.org');

  // إدخال رقم الهاتف
  await page.waitForSelector('input[type="tel"]');
  await page.type('input[type="tel"]', '+18144753793');
  await page.click('button[type="submit"]');

  // انتظار رمز التحقق
  await page.waitForSelector('input[type="text"]');
  const code = await getCodeFromUser(); // افترض أن هذه الوظيفة تستدعي المستخدم لإدخال الرمز
  await page.type('input[type="text"]', code);
  await page.click('button[type="submit"]');

  // الانتظار حتى يتم تسجيل الدخول بنجاح
  await page.waitForNavigation();

  console.log('تم تسجيل الدخول بنجاح.');
  await browser.close();
})();

// وظيفة للحصول على رمز التحقق من المستخدم
async function getCodeFromUser() {
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
