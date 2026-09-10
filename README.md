# PorAI — محمد پورائی | Mohammad Pouraei

> **هوش مصنوعی کاربردی برای کار، مهندسی و زندگی**
> Practical AI for Work, Engineering and Life

وب‌سایت دوزبانه (فارسی/انگلیسی) برند شخصی + آموزش AI + پلتفرم دوره + پنل کاربر + پنل ادمین.

---

## ✨ امکانات

| بخش | وضعیت |
|---|---|
| صفحه خانه، درباره، آموزش (Hub)، دوره‌ها، ابزارها، پروژه‌ها، بلاگ، مسیر من | ✅ کامل |
| دوزبانگی کامل `/fa` و `/en` با RTL/LTR واقعی | ✅ کامل |
| ثبت‌نام (نام + موبایل + رمز) و ورود با موبایل + رمز | ✅ + فراموشی رمز با کد پیامک (فعلاً نمایشی) |
| داشبورد کاربر (دوره‌ها، پیشرفت، ذخیره‌ها، تاریخچه، اعلان‌ها، تنظیمات) | ✅ کامل |
| پنل ادمین (آمار، مقالات، دوره‌ها+ماژول+درس، کاربران، ابزارها، پروژه‌ها، مسیر، درخواست‌ها، خبرنامه، تنظیمات) | ✅ کامل |
| جست‌وجوی سراسری، خبرنامه، فرم همکاری و تماس | ✅ کامل |
| سئو (متا، OG، canonical، sitemap، robots، اسکیما) | ✅ کامل |
| پرداخت (زرین‌پال/Stripe)، پیامک واقعی، فید اینستاگرام | 🔌 معماری آماده (فصل ۵) |

---

## ۱) اجرای محلی (۵ دقیقه)

پیش‌نیاز: **Node.js 22+**

```bash
cd mohammadwebsite
npm install
cp .env.example .env
# داخل .env این دو را عوض کن:
# SESSION_SECRET=یک-رشته-تصادفی-بلند
# ADMIN_PHONES=شماره-موبایل-خودت (مثلا 09123456789)

npm run db:seed     # ساخت دیتابیس + محتوای نمونه دوزبانه
npm run dev         # اجرا روی http://localhost:3000
```

- سایت فارسی: `http://localhost:3000/fa`
- سایت انگلیسی: `http://localhost:3000/en`
- ورود ادمین: اول با همان شماره‌ای که در `ADMIN_PHONES` گذاشتی **ثبت‌نام** کن (نام + موبایل + رمز) — خودکار مدیرکل می‌شوی — بعد برو به `/fa/admin`. اگر حسابی از قبل داری و رمزش را نمی‌دانی، از «فراموشی رمز» استفاده کن (کد در حالت نمایشی روی صفحه نمایش داده می‌شود).

---

## ۲) انتشار روی دامنه `.ir` (اولین تجربه — قدم‌به‌قدم)

ساده‌ترین راه مطمئن برای دامنه `.ir`: **سرور مجازی (VPS) ایرانی + همین پروژه**.

### قدم ۱ — خرید
1. یک VPS ایرانی (اوبونتو ۲۴) با حداقل ۱ گیگ رم از هر ارائه‌دهنده‌ای که راحتی (پارس‌پک، لیزرهاست، آروان، …).
2. دامنه `.ir` را از ایرنیک (nic.ir) بگیر و یک رکورد `A` به آی‌پی سرورت بده:
   - `@` → آی‌پی سرور
   - `www` → آی‌پی سرور

### قدم ۲ — آماده‌سازی سرور (یک‌بار)
```bash
# اتصال با SSH
ssh root@YOUR_SERVER_IP

# نصب Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs nginx certbot python3-certbot-nginx

node -v   # باید 22+ باشد
```

### قدم ۳ — نصب سایت
```bash
mkdir -p /var/www && cd /var/www
git clone <آدرس-ریپو-تو> porai && cd porai
npm install
cp .env.example .env
nano .env
# این‌ها را تنظیم کن:
# NEXT_PUBLIC_SITE_URL="https://yourdomain.ir"
# SESSION_SECRET="..."   (یک رشته تصادفی بلند و یکتا)
# ADMIN_PHONES="09123456789"
# SMS_PROVIDER="demo"    (تا وقتی پنل پیامک گرفتی)

npm run db:seed
npm run build

# اجرای دائمی با PM2
npm i -g pm2
pm2 start npm --name porai -- run start -- --hostname 127.0.0.1 --port 3000
pm2 save && pm2 startup
```

### قدم ۴ — اتصال دامنه + HTTPS رایگان
```nginx
# /etc/nginx/sites-available/porai
server {
  server_name yourdomain.ir www.yourdomain.ir;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```
```bash
ln -s /etc/nginx/sites-available/porai /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d yourdomain.ir -d www.yourdomain.ir
```

تمام شد — سایت با HTTPS روی دامنه `.ir` بالا است. 🎉

> **بکاپ:** کل دیتابیس فقط یک فایل است: `dev.db`. هر شب آن را + پوشه `public/uploads` را کپی بگیر.

---

## ۳) متغیرهای محیطی (`.env`)

| متغیر | توضیح |
|---|---|
| `DATABASE_URL` | پیش‌فرض `file:./dev.db` (تک‌فایل، بدون هزینه) |
| `NEXT_PUBLIC_SITE_URL` | آدرس نهایی سایت (برای سئو/canonical) |
| `SESSION_SECRET` | حداقل ۳۲ کاراکتر تصادفی — **حتماً عوض کن** |
| `ADMIN_PHONES` | شماره‌هایی که با اول
...[truncated 3697 chars]