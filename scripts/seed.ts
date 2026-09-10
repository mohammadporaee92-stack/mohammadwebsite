// PorAI seed — premium bilingual starter content (FA + EN).
// Re-runnable: uses upserts. Run: npm run db:seed

import { Settings, Cats, Tags, Articles, Courses, Tools, Projects, Journey, run } from "../src/lib/db";

async function main() {
  // ---------- Settings ----------
  const settings: Record<string, string> = {
    site_name_fa: "پورای‌آی | محمد پرایی",
    site_name_en: "PorAI | Mohammad Poraee",
    tagline_fa: "هوش مصنوعی کاربردی برای کار، مهندسی و زندگی",
    tagline_en: "Practical AI for Work, Engineering and Life",
    bio_fa:
      "محمد پرایی هستم؛ فارغ‌التحصیل کارشناسی ارشد مهندسی برق از دانشگاه خواجه نصیرالدین طوسی و مهندس شاغل در صنعت نفت و گاز. چند سال است که هوش مصنوعی را نه فقط به‌عنوان یک علاقه، بلکه به‌عنوان ابزار واقعی کار یاد می‌گیرم، تست می‌کنم و می‌سازم. ماموریت من ساده است: کمک به مهندسان، مدیران و حرفه‌ای‌ها تا از AI در دنیای واقعی استفاده کنند.",
    bio_en:
      "I'm Mohammad Poraee — MSc in Electrical Engineering (K. N. Toosi University of Technology) and an engineer in the Oil & Gas industry. For years I've been learning, testing and building with AI as a real work tool, not just a hobby. My mission is simple: help engineers, managers and professionals actually use AI in the real world.",
    profile_image: "",
    instagram: "mohammad_por_ai",
    linkedin: "",
    youtube: "",
    telegram: "",
    contact_email: "hello@mohammadporaee.com",
    default_lang: "fa",
    seo_title_fa: "محمد پرایی | آموزش کاربردی هوش مصنوعی برای مهندسی و کسب‌وکار",
    seo_title_en: "Mohammad Poraee | Practical AI for Engineering and Business",
    seo_desc_fa:
      "آموزش عملی هوش مصنوعی: ChatGPT، پرامپت‌نویسی، اتوماسیون، ایجنت‌های AI و کاربرد AI در مهندسی برق و نفت و گاز.",
    seo_desc_en:
      "Practical AI education: ChatGPT, prompt engineering, automation, AI agents, and AI for electrical engineering and oil & gas.",
  };
  for (const [key, value] of Object.entries(settings)) Settings.set(key, value);

  // ---------- Categories ----------
  const cats: Array<{ slug: string; kind: string; nameFa: string; nameEn: string; descFa: string; descEn: string; icon: string; sortOrder: number }> = [
    { slug: "ai-basics", kind: "tutorial", nameFa: "مبانی AI", nameEn: "AI Basics", descFa: "از صفر: هوش مصنوعی چیست و چطور از آن استفاده کنیم.", descEn: "From zero: what AI is and how to use it.", icon: "spark", sortOrder: 1 },
    { slug: "chatgpt", kind: "tutorial", nameFa: "ChatGPT", nameEn: "ChatGPT", descFa: "کار حرفه‌ای با ChatGPT در کار روزمره.", descEn: "Working professionally with ChatGPT.", icon: "chat", sortOrder: 2 },
    { slug: "prompt-engineering", kind: "tutorial", nameFa: "مهندسی پرامپت", nameEn: "Prompt Engineering", descFa: "هنر درست سوال پرسیدن از AI.", descEn: "The art of asking AI correctly.", icon: "terminal", sortOrder: 3 },
    { slug: "ai-tools", kind: "tutorial", nameFa: "ابزارهای AI", nameEn: "AI Tools", descFa: "معرفی و آموزش ابزارهای کاربردی.", descEn: "Practical AI tool guides.", icon: "wrench", sortOrder: 4 },
    { slug: "ai-engineering", kind: "tutorial", nameFa: "AI برای مهندسی", nameEn: "AI for Engineering", descFa: "AI در طراحی، محاسبات و مستندات مهندسی.", descEn: "AI in design, calculation and docs.", icon: "cog", sortOrder: 5 },
    { slug: "ai-electrical", kind: "tutorial", nameFa: "AI برای مهندسی برق", nameEn: "AI for Electrical Eng.", descFa: "کاربرد AI در برق قدرت، کنترل و مدار.", descEn: "AI for power, control and circuits.", icon: "bolt", sortOrder: 6 },
    { slug: "ai-oilgas", kind: "tutorial", nameFa: "AI برای نفت و گاز", nameEn: "AI for Oil & Gas", descFa: "کاربردهای واقعی AI در صنعت نفت و گاز.", descEn: "Real AI use-cases in oil & gas.", icon: "flame", sortOrder: 7 },
    { slug: "ai-business", kind: "tutorial", nameFa: "AI برای کسب‌وکار", nameEn: "AI for Business", descFa: "رشد کسب‌وکار با AI.", descEn: "Growing business with AI.", icon: "chart", sortOrder: 8 },
    { slug: "ai-productivity", kind: "tutorial", nameFa: "AI برای بهره‌وری", nameEn: "AI for Productivity", descFa: "چند برابر کردن خروجی روزانه.", descEn: "Multiplying daily output.", icon: "rocket", sortOrder: 9 },
    { slug: "ai-content", kind: "tutorial", nameFa: "AI برای تولید محتوا", nameEn: "AI for Content", descFa: "تولید محتوای متنی و تصویری با AI.", descEn: "Text & visual content with AI.", icon: "pen", sortOrder: 10 },
    { slug: "ai-automation", kind: "tutorial", nameFa: "اتوماسیون با AI", nameEn: "AI Automation", descFa: "خودکارسازی فرایندهای تکراری.", descEn: "Automating repetitive workflows.", icon: "flow", sortOrder: 11 },
    { slug: "ai-agents", kind: "tutorial", nameFa: "ایجنت‌های AI", nameEn: "AI Agents", descFa: "ساخت دستیارهای خودکار چندمرحله‌ای.", descEn: "Building multi-step AI assistants.", icon: "bot", sortOrder: 12 },
    { slug: "ai-research", kind: "tutorial", nameFa: "AI برای تحقیق", nameEn: "AI for Research", descFa: "تحقیق سریع‌تر و عمیق‌تر با AI.", descEn: "Faster, deeper research with AI.", icon: "search", sortOrder: 13 },
    { slug: "ai-economics", kind: "tutorial", nameFa: "AI و اقتصاد", nameEn: "AI & Economics", descFa: "تحلیل اقتصادی و تصمیم‌گیری با AI.", descEn: "Economic analysis with AI.", icon: "coin", sortOrder: 14 },
    { slug: "ai-growth", kind: "tutorial", nameFa: "رشد فردی با AI", nameEn: "AI for Growth", descFa: "یادگیری و رشد فردی با کمک AI.", descEn: "Learning and self-growth with AI.", icon: "leaf", sortOrder: 15 },
    { slug: "artificial-intelligence", kind: "article", nameFa: "هوش مصنوعی", nameEn: "Artificial Intelligence", descFa: "تحلیل‌ها و یادداشت‌های AI.", descEn: "AI analysis and notes.", icon: "spark", sortOrder: 20 },
    { slug: "engineering", kind: "article", nameFa: "مهندسی", nameEn: "Engineering", descFa: "از دنیای مهندسی و صنعت.", descEn: "From engineering and industry.", icon: "cog", sortOrder: 21 },
    { slug: "productivity", kind: "article", nameFa: "بهره‌وری", nameEn: "Productivity", descFa: "کار عمیق‌تر با زمان کمتر.", descEn: "Deeper work in less time.", icon: "rocket", sortOrder: 22 },
    { slug: "technology", kind: "article", nameFa: "تکنولوژی", nameEn: "Technology", descFa: "ترندهای فناوری که مهم‌اند.", descEn: "Tech trends that matter.", icon: "chip", sortOrder: 23 },
    { slug: "economics", kind: "article", nameFa: "اقتصاد", nameEn: "Economics", descFa: "نگاه اقتصادی به تکنولوژی.", descEn: "An economic lens on tech.", icon: "coin", sortOrder: 24 },
    { slug: "personal-growth", kind: "article", nameFa: "رشد فردی", nameEn: "Personal Growth", descFa: "مسیر یادگیری و رشد.", descEn: "The learning journey.", icon: "leaf", sortOrder: 25 },
    { slug: "course-starter", kind: "course", nameFa: "مسیر شروع", nameEn: "Starter Path", descFa: "برای شروع از صفر.", descEn: "Start from zero.", icon: "flag", sortOrder: 30 },
    { slug: "course-pro", kind: "course", nameFa: "مسیر حرفه‌ای", nameEn: "Pro Path", descFa: "برای کاربرد حرفه‌ای.", descEn: "For professional use.", icon: "medal", sortOrder: 31 },
    { slug: "tool-chat", kind: "tool", nameFa: "چت‌بات‌ها", nameEn: "Chatbots", descFa: "", descEn: "", icon: "chat", sortOrder: 40 },
    { slug: "tool-research", kind: "tool", nameFa: "تحقیق", nameEn: "Research", descFa: "", descEn: "", icon: "search", sortOrder: 41 },
    { slug: "tool-automation", kind: "tool", nameFa: "اتوماسیون", nameEn: "Automation", descFa: "", descEn: "", icon: "flow", sortOrder: 42 },
    { slug: "tool-media", kind: "tool", nameFa: "صوت و تصویر", nameEn: "Media", descFa: "", descEn: "", icon: "pen", sortOrder: 43 },
  ];
  for (const c of cats) Cats.upsert(c);
  const catId = (slug: string) => Cats.bySlug(slug)!.id;

  // ---------- Tags ----------
  for (const t of [
    { slug: "chatgpt", nameFa: "چت‌جی‌پی‌تی", nameEn: "ChatGPT" },
    { slug: "prompt", nameFa: "پرامپت", nameEn: "Prompting" },
    { slug: "automation", nameFa: "اتوماسیون", nameEn: "Automation" },
    { slug: "rag", nameFa: "RAG", nameEn: "RAG" },
    { slug: "agents", nameFa: "ایجنت‌ها", nameEn: "Agents" },
  ]) Tags.upsert(t.slug, t.nameFa, t.nameEn);

  // ---------- Tutorials & Articles ----------
  const posts = [
    {
      slug: "how-ai-actually-works", kind: "tutorial", status: "published",
      category: "ai-basics", difficulty: "beginner", readMinutes: 8,
      titleFa: "هوش مصنوعی دقیقاً چطور کار می‌کند؟ (بدون فرمول و تئوری خشک)",
      titleEn: "How Does AI Actually Work? (No Math, No Hype)",
      excerptFa: "در ۸ دقیقه بفهم مدل‌های زبانی چه می‌کنند، کجا عالی‌اند و کجا نباید بهشان اعتماد کنی.",
      excerptEn: "In 8 minutes, understand what LLMs do, where they shine, and where not to trust them.",
      contentFa: `## ایده اصلی در یک پاراگراف\n\nمدل‌های زبانی مثل ChatGPT در واقع «حدس‌زننده کلمه بعدی» هستند؛ با دیدن میلیاردها متن یاد گرفته‌اند که بعد از هر جمله، محتمل‌ترین ادامه چیست. همین توانایی ساده، وقتی در مقیاس بزرگ آموزش ببیند، تبدیل به چیزی می‌شود که می‌تواند بنویسد، خلاصه کند، کد بزند و استدلال کند.\n\n## سه چیزی که باید بدانی\n\n- **AI دانشمند نیست؛ دستیار است.** خروجی‌اش را همیشه راستی‌آزمایی کن، مخصوصاً در مهندسی و اعداد.\n- **کیفیت ورودی = کیفیت خروجی.** هرچه زمینه (Context) بهتری بدهی، جواب بهتری می‌گیری.\n- **تکرار و اصلاح مهم است.** اولین جواب معمولاً پیش‌نویس است؛ با گفت‌وگو بهترش کن.\n\n## یک تمرین ۵ دقیقه‌ای\n\n1. یک ایمیل کاری واقعی را باز کن.\n2. از AI بخواه در ۳ خط خلاصه‌اش کند.\n3. بعد بخواه ۳ نسخه جواب (رسمی، دوستانه، کوتاه) بنویسد.\n\n> قانون من: «یاد بگیر، تست کن، بساز، به اشتراک بگذار.» همین امروز شروع کن.`,
      contentEn: `## The core idea in one paragraph\n\nLanguage models like ChatGPT are essentially "next-word predictors". Trained on billions of texts, they learned what continuation is most likely after any sentence. This simple ability, at massive scale, becomes something that can write, summarize, code and reason.\n\n## Three things you must know\n\n- **AI is an assistant, not a scientist.** Always verify outputs — especially in engineering and numbers.\n- **Input quality = output quality.** Better context gives better answers.\n- **Iterate.** The first answer is a draft; refine it through conversation.\n\n## A 5-minute exercise\n\n1. Open a real work email.\n2. Ask AI to summarize it in 3 lines.\n3. Ask for 3 reply drafts (formal, friendly, short).\n\n> My rule: "Learn. Test. Build. Share." Start today.`,
    },
    {
      slug: "prompt-engineering-30-minutes", kind: "tutorial", status: "published",
      category: "prompt-engineering", difficulty: "beginner", readMinutes: 12,
      titleFa: "مهندسی پرامپت در ۳۰ دقیقه: فرمول ۴ بخشی",
      titleEn: "Prompt Engineering in 30 Minutes: The 4-Part Formula",
      excerptFa: "با فرمول نقش + زمینه + وظیفه + قالب، از همان امروز جواب‌های ۱۰ برابر بهتر بگیر.",
      excerptEn: "With the Role + Context + Task + Format formula, get 10x better answers starting today.",
      contentFa: `## فرمول ۴ بخشی\n\nهر پرامپت خوب ۴ جزء دارد:\n\n1. **نقش (Role):** تو یک مهندس برق ارشد هستی...\n2. **زمینه (Context):** من روی تابلو برق صنعتی کار می‌کنم...\n3. **وظیفه (Task):** یک چک‌لیست بازبینی بنویس...\n4. **قالب (Format):** جدول با ستون‌های آیتم، استاندارد، وضعیت...\n\n## مثال واقعی\n\n\`\`\`\nتو یک متخصص اتوماسیون صنعتی هستی.\nزمینه: یک کارخانه با ۳ خط تولید و گزارش‌گیری دستی.\nوظیفه: ۵ فرصت اتوماسیون با AI را اولویت‌بندی کن.\nقالب: جدول با ستون‌های فرصت، صرفه‌جویی، سختی اجرا.\n\`\`\`\n\n## سه اشتباه رایج\n\n- سوال کلی پرسیدن («درباره AI بگو»)\n- ندادن مثال و معیار کیفیت\n- قبول کردن اولین جواب بدون اصلاح`,
      contentEn: `## The 4-part formula\n\nEvery good prompt has 4 parts:\n\n1. **Role:** You are a senior electrical engineer...\n2. **Context:** I work on industrial panels...\n3. **Task:** Write a review checklist...\n4. **Format:** A table with item, standard, status columns...\n\n## Real example\n\n\`\`\`\nYou are an industrial automation expert.\nContext: a factory with 3 lines and manual reporting.\nTask: prioritize 5 AI automation opportunities.\nFormat: table with opportunity, savings, difficulty.\n\`\`\`\n\n## Three common mistakes\n\n- Asking vague questions ("tell me about AI")\n- Giving no examples or quality bar\n- Accepting the first answer without iterating`,
    },
    {
      slug: "chatgpt-for-electrical-engineers", kind: "tutorial", status: "published",
      category: "ai-electrical", difficulty: "intermediate", readMinutes: 10,
      titleFa: "ChatGPT برای مهندسان برق: ۷ کاربرد واقعی",
      titleEn: "ChatGPT for Electrical Engineers: 7 Real Use-Cases",
      excerptFa: "از تفسیر منحنی‌ها تا نوشتن گزارش تست؛ کاربردهایی که خودم در صنعت استفاده کرده‌ام.",
      excerptEn: "From interpreting curves to writing test reports — uses I've applied in industry.",
      contentFa: `## چرا مهندس برق باید AI بلد باشد؟\n\nبخش بزرگی از کار ما «دانش + مستندسازی» است: خواندن استاندارد، نوشتن گزارش، بررسی مدارک. AI دقیقاً در همین‌ها قوی است.\n\n## ۷ کاربرد واقعی\n\n1. **خلاصه‌سازی استانداردها:** بخش مربوط به حفاظت را از IEC استخراج کن.\n2. **چک‌لیست بازبینی نقشه:** برای Single-Line Diagram چک‌لیست بده.\n3. **پیش‌نویس گزارش تست:** داده‌های خام را بده، گزارش ساخت‌یافته بگیر.\n4. **منطق PLC:** پیش‌نویس منطق ساده و توضیح خط‌به‌خط.\n5. **تحلیل خطا:** علائم را بده، درخت عیب‌یابی بگیر.\n6. **آموزش سریع:** مفاهیم کنترل را با مثال ساده توضیح بده.\n7. **ایمیل فنی:** تبدیل یادداشت فارسی به ایمیل رسمی انگلیسی.\n\n> هشدار مهندسی: محاسبات AI را همیشه با ابزار معتبر چک کن. AI دستیار است، نه مرجع محاسبه.`,
      contentEn: `## Why should electrical engineers learn AI?\n\nMuch of our work is "knowledge + documentation": reading standards, writing reports, reviewing documents. AI is exactly strong at these.\n\n## 7 real use-cases\n\n1. **Summarizing standards:** extract protection clauses from IEC.\n2. **Drawing review checklists:** for Single-Line Diagrams.\n3. **Test report drafts:** raw data in, structured report out.\n4. **PLC logic drafts:** simple ladder logic with explanations.\n5. **Fault analysis:** symptoms in, troubleshooting tree out.\n6. **Fast learning:** control concepts with simple examples.\n7. **Technical emails:** rough notes to formal English emails.\n\n> Engineering warning: always verify AI calculations with trusted tools. AI is an assistant, not a calculation authority.`,
    },
    {
      slug: "ai-in-oil-and-gas", kind: "tutorial", status: "published",
      category: "ai-oilgas", difficulty: "intermediate", readMinutes: 9,
      titleFa: "کاربردهای واقعی AI در نفت و گاز (از تجربه صنعت)",
      titleEn: "Real AI Applications in Oil & Gas (From Industry Experience)",
      excerptFa: "نه حرف‌های کلی؛ ۶ جایی که AI امروز در نفت و گاز ارزش واقعی می‌سازد.",
      excerptEn: "No buzzwords; 6 places where AI creates real value in oil & gas today.",
      contentFa: `## واقعیت صنعت\n\nدر نفت و گاز، «قابلیت اطمینان» از «هیجان» مهم‌تر است. پس AI موفق آنجایی است که به مهندس کمک کند سریع‌تر و کم‌خطاتر تصمیم بگیرد، نه اینکه جای او تصمیم بگیرد.\n\n## ۶ کاربرد واقعی\n\n- **مرور مدارک مهندسی:** پیدا کردن مغایرت‌ها در صدها صفحه Datasheet و Spec.\n- **گزارش‌نویسی شیفت:** تبدیل یادداشت‌های پراکنده به گزارش استاندارد.\n- **جست‌وجوی دانش فنی:** پرسش از روی Procedureها با RAG.\n- **پایش وضعیت:** خلاصه‌سازی هشدارها و اولویت‌بندی آن‌ها.\n- **آموزش نیروها:** ساخت کوییز و سناریوی آموزشی از روی مدارک واقعی.\n- **ترجمه فنی:** فارسی به انگلیسی و برعکس با حفظ اصطلاحات تخصصی.\n\n## از کجا شروع کنیم؟\n\nاز یک فرایند کوچک و تکراری شروع کن؛ نتیجه را اندازه بگیر؛ بعد گسترش بده.`,
      contentEn: `## Industry reality\n\nIn oil & gas, reliability beats hype. Successful AI helps engineers decide faster with fewer errors — not decide for them.\n\n## 6 real applications\n\n- **Document review:** finding conflicts across hundreds of datasheet/spec pages.\n- **Shift reporting:** scattered notes into standard reports.\n- **Technical knowledge search:** asking questions over procedures with RAG.\n- **Condition monitoring:** summarizing and prioritizing alarms.\n- **Workforce training:** quizzes and scenarios from real documents.\n- **Technical translation:** FA-EN with terminology preserved.\n\n## Where to start?\n\nStart with one small repetitive process, measure the result, then scale.`,
    },
    {
      slug: "first-automation", kind: "tutorial", status: "published",
      category: "ai-automation", difficulty: "beginner", readMinutes: 11,
      titleFa: "اولین اتوماسیون‌ات را این هفته بساز (قدم‌به‌قدم)",
      titleEn: "Build Your First Automation This Week (Step by Step)",
      excerptFa: "یک فرایند تکراری را انتخاب کن، خودکارش کن و ساعت‌ها در ماه ذخیره کن.",
      excerptEn: "Pick one repetitive process, automate it, and save hours every month.",
      contentFa: `## معیار انتخاب فرایند\n\nبهترین کاندیداها: تکراری، قانون‌مند، وقت‌گیر و کم‌ریسک. مثال: دسته‌بندی ایمیل‌ها، تولید گزارش هفتگی، ثبت داده در اکسل.\n\n## قدم‌ها\n\n1. فرایند را در ۵ تا ۱۰ قدم بنویس.\n2. ورودی و خروجی هر قدم را مشخص کن.\n3. قدم‌هایی که «تصمیم انسانی» می‌خواهند جدا کن (AI پیشنهاد می‌دهد، انسان تایید می‌کند).\n4. با یک ابزار ساده (مثل Make یا Zapier یا حتی اسکریپت) نسخه اول را بساز.\n5. یک هفته اجرا کن و خطاها را یادداشت کن.\n\n> اتوماسیون خوب، اتوماسیونی است که «قابل اعتماد» باشد، نه لزوماً «هوشمند».`,
      contentEn: `## How to pick a process\n\nBest candidates: repetitive, rule-based, time-consuming, low-risk. Examples: email triage, weekly reports, spreadsheet entry.\n\n## Steps\n\n1. Write the process in 5–10 steps.\n2. Define each step's input and output.\n3. Isolate steps needing human judgment (AI suggests, human approves).\n4. Build v1 with a simple tool (Make, Zapier, or a script).\n5. Run for a week and log errors.\n\n> A good automation is trustworthy, not necessarily "smart".`,
    },
    {
      slug: "learn-test-build-share", kind: "article", status: "published",
      category: "personal-growth", difficulty: "beginner", readMinutes: 6,
      titleFa: "فلسفه من: یاد بگیر، تست کن، بساز، به اشتراک بگذار",
      titleEn: "My Philosophy: Learn. Test. Build. Share.",
      excerptFa: "چرا از مهندسی سنتی به ترکیب مهندسی و AI رسیدم و چطور یاد می‌گیرم.",
      excerptEn: "Why I moved from traditional engineering to engineering × AI, and how I learn.",
      contentFa: `## از برق تا AI\n\nمن مهندس برقم؛ فوق‌لیسانس از خواجه نصیر و شاغل در نفت و گاز. چند سال پیش فهمیدم ابزارهای AI دارند «سرعت یادگیری و اجرای» آدم‌ها را چند برابر می‌کنند. تصمیم گرفتم جدی یادشان بگیرم — نه به‌عنوان تماشاگر، بلکه به‌عنوان سازنده.\n\n## چرخه من\n\n- **یاد بگیر:** یک مفهوم، یک ابزار، یک تکنیک.\n- **تست کن:** روی کار واقعی خودم امتحانش کن.\n- **بساز:** یک اتوماسیون، یک ایجنت، یک سیستم کوچک.\n- **به اشتراک بگذار:** نتیجه را ساده و صادقانه منتشر کن.\n\nمن ادعا نمی‌کنم همه‌چیز AI را می‌دانم. من یک practitioner هستم: یاد می‌گیرم، تست می‌کنم و چیزی را که جواب داده با تو به اشتراک می‌گذارم.`,
      contentEn: `## From power systems to AI\n\nI'm an electrical engineer — MSc from K. N. Toosi University, working in oil & gas. Years ago I realized AI tools multiply people's learning and execution speed. I decided to learn them seriously — not as a spectator, but as a builder.\n\n## My loop\n\n- **Learn:** one concept, one tool, one technique.\n- **Test:** try it on my real work.\n- **Build:** an automation, an agent, a small system.\n- **Share:** publish the result simply and honestly.\n\nI don't claim to know everything about AI. I'm a practitioner: I learn, test, and share what actually worked.`,
    },
    {
      slug: "ai-economics-for-professionals", kind: "article", status: "published",
      category: "economics", difficulty: "intermediate", readMinutes: 7,
      titleFa: "اقتصاد هوش مصنوعی برای حرفه‌ای‌ها: ۳ موج",
      titleEn: "AI Economics for Professionals: 3 Waves",
      excerptFa: "بهره‌وری فردی، اتوماسیون فرایندها، و مدل‌های کسب‌وکار جدید.",
      excerptEn: "Personal productivity, process automation, and new business models.",
      contentFa: `## موج اول: بهره‌وری فردی\n\nهر حرفه‌ای با AI می‌تواند ۲۰ تا ۵۰ درصد در کارهای دانشی سریع‌تر شود. این موج همین حالاست و هزینه ورودش تقریباً صفر است.\n\n## موج دوم: اتوماسیون فرایندها\n\nشرکت‌ها فرایندهای کامل را با AI و اتوماسیون بازطراحی می‌کنند. برنده‌ها کسانی‌اند که فرایند را می‌فهمند، نه فقط ابزار را.\n\n## موج سوم: مدل‌های جدید\n\nمحصولات و خدماتی که قبلاً اقتصادی نبودند، حالا ممکن می‌شوند: آموزش شخصی‌سازی‌شده، مشاوره خودکار، پشتیبانی هوشمند.\n\n## پیام برای تو\n\nروی موج اول سوار شو (مهارت فردی)، برای موج دوم آماده شو (اتوماسیون)، و موج سوم را زیر نظر بگیر.`,
      contentEn: `## Wave 1: Personal productivity\n\nEvery professional can get 20–50% faster at knowledge work with AI. This wave is now, and entry costs almost zero.\n\n## Wave 2: Process automation\n\nCompanies redesign entire processes with AI + automation. Winners understand processes, not just tools.\n\n## Wave 3: New models\n\nPreviously uneconomical products become possible: personalized tutoring, automated consulting, smart support.\n\n## The message for you\n\nRide wave 1 (personal skill), prepare for wave 2 (automation), watch wave 3.`,
    },
    {
      slug: "ai-productivity-system", kind: "tutorial", status: "published",
      category: "ai-productivity", difficulty: "beginner", readMinutes: 8,
      titleFa: "سیستم بهره‌وری من با AI: صبح‌ها ۳۰ دقیقه جلوتر",
      titleEn: "My AI Productivity System: 30 Minutes Ahead Every Morning",
      excerptFa: "یک روتین ساده صبحگاهی با AI برای برنامه‌ریزی، ایمیل و اولویت‌بندی.",
      excerptEn: "A simple morning routine with AI for planning, email and priorities.",
      contentFa: `## روتین ۱۵ دقیقه‌ای\n\n1. **تخلیه ذهن:** همه کارها را در یک پیام بنویس.\n2. **اولویت‌بندی:** از AI بخواه با ماتریس Eisenhower مرتبشان کند.\n3. **زمان‌بندی:** به تقویم امروزت تبدیلشان کن.\n4. **ایمیل‌ها:** مهم‌ها را خلاصه کن، پیش‌نویس جواب بگیر.\n\n## قانون طلایی\n\nAI تصمیم‌گیر نیست؛ «پیش‌نویس‌نویس» است. تصمیم نهایی همیشه با توست — ولی با پیش‌نویس خوب، تصمیم ۱۰ برابر سریع‌تر گرفته می‌شود.`,
      contentEn: `## The 15-minute routine\n\n1. **Brain dump:** write all tasks in one message.\n2. **Prioritize:** ask AI to sort with the Eisenhower matrix.\n3. **Schedule:** turn them into today's calendar.\n4. **Emails:** summarize important ones, draft replies.\n\n## The golden rule\n\nAI is not the decider; it's the drafter. The final call is always yours — but with a good draft, decisions are 10x faster.`,
    },
  ];

  for (const p of posts) {
    Articles.upsertBySlug(p.slug, {
      ...p,
      categoryId: catId(p.category),
      views: 120 + p.slug.length * 41,
    } as never);
  }

  // link a few tags
  const tagId = (slug: string) => (Tags.all().find((t) => (t as { slug: string }).slug === slug) as { id: string } | undefined)?.id;
  const artId = (slug: string) => Articles.bySlug(slug)!.id;
  const link = (slug: string, tags: string[]) => {
    const ids = tags.map(tagId).filter(Boolean) as string[];
    if (ids.length) Tags.setForArticle(artId(slug), ids);
  };
  link("prompt-engineering-30-minutes", ["prompt", "chatgpt"]);
  link("chatgpt-for-electrical-engineers", ["chatgpt"]);
  link("first-automation", ["automation"]);
  link("ai-in-oil-and-gas", ["rag"]);

  // ---------- Courses ----------
  const starterId = catId("course-starter");
  const proId = catId("course-pro");

  const courses = [
    {
      slug: "practical-chatgpt-start",
      titleFa: "شروع عملی با ChatGPT (مینی‌دوره رایگان)",
      titleEn: "Practical Start with ChatGPT (Free Mini-Course)",
      descFa: "در ۵ درس کوتاه، ChatGPT را به دستیار واقعی کارت تبدیل کن: از ساخت اکانت تا پرامپت‌های حرفه‌ای برای ایمیل، گزارش و تحقیق.",
      descEn: "In 5 short lessons, turn ChatGPT into your real work assistant: from setup to pro prompts for email, reports and research.",
      outcomesFa: "کار با ChatGPT از صفر\nنوشتن پرامپت حرفه‌ای\nخلاصه‌سازی و گزارش‌نویسی\nتحقیق سریع‌تر\nساخت روتین روزانه با AI",
      outcomesEn: "Using ChatGPT from zero\nWriting pro prompts\nSummarizing and reporting\nFaster research\nBuilding a daily AI routine",
      audienceFa: "مبتدی‌ها\nکارمندان و مدیران\nدانشجویان\nتولیدکنندگان محتوا",
      audienceEn: "Beginners\nEmployees and managers\nStudents\nContent creators",
      prereqFa: "هیچ پیش‌نیازی لازم نیست؛ فقط یک کامپیوتر یا موبایل.",
      prereqEn: "No prerequisites; just a computer or phone.",
      priceType: "free", level: "beginner", lang: "both", status: "published", featured: true, categoryId: starterId,
      modules: [
        { titleFa: "شروع کار", titleEn: "Getting Started", lessons: [
          { titleFa: "ChatGPT چیست و چطور شروع کنیم", titleEn: "What is ChatGPT & how to start", bodyFa: "## در این درس\n\n- ساخت اکانت و آشنایی با محیط\n- تفاوت نسخه رایگان و پلاس\n- اولین گفت‌وگوی درست\n\n## تمرین\n\nاز ChatGPT بخواه خودش را در ۳ خط معرفی کند، بعد یک سوال کاری واقعی از او بپرس.", bodyEn: "## In this lesson\n\n- Account setup and tour\n- Free vs Plus\n- Your first good conversation\n\n## Exercise\n\nAsk ChatGPT to introduce itself in 3 lines, then ask one real work question.", durationMin: 12, isFree: true },
          { titleFa: "فرمول پرامپت خوب", titleEn: "The good-prompt formula", bodyFa: "## فرمول ۴ بخشی\n\nنقش + زمینه + وظیفه + قالب. با مثال واقعی ایمیل و گزارش تمرین می‌کنیم.", bodyEn: "## The 4-part formula\n\nRole + Context + Task + Format. We practice with real email and report examples.", durationMin: 15, isFree: true },
        ]},
        { titleFa: "کاربرد در کار", titleEn: "AI at Work", lessons: [
          { titleFa: "ایمیل و گزارش در نصف زمان", titleEn: "Email & reports in half the time", bodyFa: "خلاصه‌سازی، پیش‌نویس جواب و تبدیل یادداشت به گزارش رسمی.", bodyEn: "Summarizing, drafting replies, turning notes into formal reports.", durationMin: 14, isFree: true },
          { titleFa: "تحقیق سریع و عمیق", titleEn: "Fast, deep research", bodyFa: "تکنیک‌های تحقیق چندمرحله‌ای و راستی‌آزمایی.", bodyEn: "Multi-step research and verification techniques.", durationMin: 16, isFree: true },
          { titleFa: "ساخت روتین روزانه", titleEn: "Building a daily routine", bodyFa: "روتین صبحگاهی ۱۵ دقیقه‌ای برای همیشه. تبریک! تو دیگر کاربر مبتدی نیستی.", bodyEn: "The 15-minute morning routine, forever. Congrats — you're no longer a beginner.", durationMin: 10, isFree: true },
        ]},
      ],
    },
    {
      slug: "ai-for-engineers",
      titleFa: "AI برای مهندسان (دوره جامع)",
      titleEn: "AI for Engineers (Complete Course)",
      descFa: "دوره پروژه‌محور برای مهندسان: مستندات، گزارش‌نویسی، تحلیل داده، RAG روی مدارک فنی و ساخت اتوماسیون مهندسی.",
      descEn: "A project-based course for engineers: documentation, reporting, data analysis, RAG over technical docs, engineering automation.",
      outcomesFa: "کاربرد AI در مستندات مهندسی\nساخت RAG روی مدارک فنی\nاتوماسیون گزارش‌ها\nتحلیل داده با AI\nتعریف پروژه AI در سازمان",
      outcomesEn: "AI for engineering docs\nBuilding RAG over technical docs\nData analysis with AI\nDefining AI projects in your org",
      audienceFa: "مهندسان برق، مکانیک و صنایع\nشاغلان نفت و گاز\nمدیران فنی",
      audienceEn: "Electrical, mechanical, industrial engineers\nOil & gas professionals\nTechnical managers",
      prereqFa: "آشنایی اولیه با ChatGPT کافی است.",
      prereqEn: "Basic familiarity with ChatGPT is enough.",
      priceType: "paid", priceIrt: 2900000, priceUsd: 49, level: "intermediate", lang: "both", status: "published", featured: true, categoryId: proId,
      modules: [
        { titleFa: "AI در کار مهندسی", titleEn: "AI in Engineering Work", lessons: [
          { titleFa: "نقشه راه AI برای مهندس", titleEn: "AI roadmap for engineers", bodyFa: "کجای کار مهندسی AI بیشترین ارزش را دارد و از کجا شروع کنیم.", bodyEn: "Where AI adds most value in engineering and where to start.", durationMin: 18, isFree: true },
          { titleFa: "مرور و خلاصه مدارک فنی", titleEn: "Reviewing technical documents", bodyFa: "تکنیک‌های خلاصه‌سازی Spec و Datasheet و پیدا کردن مغایرت‌ها.", bodyEn: "Summarizing specs/datasheets and spotting conflicts.", durationMin: 22, isFree: false },
        ]},
        { titleFa: "سیستم‌های عملی", titleEn: "Working Systems", lessons: [
          { titleFa: "RAG روی مدارک خودت", titleEn: "RAG over your own docs", bodyFa: "قدم‌به‌قدم: ساخت سیستم پرسش‌وپاسخ روی Procedureها و استانداردها.", bodyEn: "Step by step: Q&A over your procedures and standards.", durationMin: 30, isFree: false },
          { titleFa: "اتوماسیون گزارش مهندسی", titleEn: "Engineering report automation", bodyFa: "از داده خام تا گزارش استاندارد؛ پروژه پایانی دوره.", bodyEn: "From raw data to standard reports; the final project.", durationMin: 28, isFree: false },
        ]},
      ],
    },
    {
      slug: "automation-workshop",
      titleFa: "کارگاه اتوماسیون با AI",
      titleEn: "AI Automation Workshop",
      descFa: "کارگاه عملی: یک فرایند واقعی کارت را انتخاب می‌کنیم و در طول کارگاه خودکارش می‌کنیم.",
      descEn: "Hands-on workshop: pick a real process from your work and automate it during the workshop.",
      outcomesFa: "شناسایی فرایند مناسب اتوماسیون\nطراحی قدم‌به‌قدم\nساخت نسخه اول\nتست و بهبود",
      outcomesEn: "Finding automation candidates\nStep-by-step design\nBuilding v1\nTesting and improving",
      audienceFa: "مدیران عملیات\nکارشناسان\nفریلنسرها",
      audienceEn: "Ops managers\nSpecialists\nFreelancers",
      prereqFa: "آشنایی اولیه با AI.",
      prereqEn: "Basic AI familiarity.",
      priceType: "free", level: "intermediate", lang: "both", status: "published", featured: false, categoryId: proId,
      modules: [
        { titleFa: "کارگاه", titleEn: "Workshop", lessons: [
          { titleFa: "انتخاب و طراحی فرایند", titleEn: "Picking & designing the process", bodyFa: "معیارها و قالب طراحی فرایند.", bodyEn: "Criteria and the process-design template.", durationMin: 25, isFree: true },
          { titleFa: "ساخت و تست", titleEn: "Build & test", bodyFa: "ساخت نسخه اول و چک‌لیست تست.", bodyEn: "Building v1 and the test checklist.", durationMin: 35, isFree: true },
        ]},
      ],
    },
  ];

  for (const c of courses) {
    const { modules, ...courseData } = c;
    const course = Courses.upsertBySlug(c.slug, courseData as never);
    run("DELETE FROM modules WHERE courseId = ?", course.id);
    for (const m of modules) {
      const mod = Courses.createModule(course.id, { titleFa: m.titleFa, titleEn: m.titleEn });
      for (const l of m.lessons) {
        Courses.createLesson(mod.id, { ...l });
      }
    }
  }

  // ---------- Tools ----------
  const tools = [
    { slug: "chatgpt", name: "ChatGPT", pricing: "freemium", website: "https://chat.openai.com", category: "tool-chat", featured: true, sortOrder: 1,
      descFa: "شناخته‌شده‌ترین دستیار AI برای نوشتن، تحلیل، کدنویسی و ایده‌پردازی.", descEn: "The most popular AI assistant for writing, analysis, coding and ideation.",
      useCasesFa: "نوشتن و ویرایش\nتحلیل و خلاصه‌سازی\nکدنویسی\nیادگیری", useCasesEn: "Writing & editing\nAnalysis & summaries\nCoding\nLearning",
      reviewFa: "ابزار شماره یک من برای کار روزمره. نسخه رایگان برای شروع عالی است؛ پلاس را اگر روزانه استفاده می‌کنی بگیر.", reviewEn: "My #1 daily driver. Free tier is great to start; get Plus if you use it daily." },
    { slug: "claude", name: "Claude", pricing: "freemium", website: "https://claude.ai", category: "tool-chat", featured: true, sortOrder: 2,
      descFa: "دستیار AI با تمرکز بر متن‌های طولانی و دقت بالا.", descEn: "AI assistant focused on long documents and high accuracy.",
      useCasesFa: "تحلیل مدارک طولانی\nنوشتن حرفه‌ای\nکدنویسی", useCasesEn: "Long-doc analysis\nProfessional writing\nCoding",
      reviewFa: "برای مدارک بلند و کارهای دقیق، گاهی از ChatGPT بهتر جواب می‌دهد. حتماً هر دو را تست کن.", reviewEn: "For long docs and precise work, sometimes beats ChatGPT. Test both." },
    { slug: "perplexity", name: "Perplexity", pricing: "freemium", website: "https://www.perplexity.ai", category: "tool-research", featured: true, sortOrder: 3,
      descFa: "موتور جست‌وجوی AI با ذکر منبع؛ جایگزین هوشمند گوگل برای تحقیق.", descEn: "AI search engine with citations; a smart Google replacement for research.",
      useCasesFa: "تحقیق سریع\nراستی‌آزمایی\nیافتن منابع", useCasesEn: "Fast research\nFact-checking\nFinding sources",
      reviewFa: "برای تحقیق روزانه عالی است چون منبع می‌دهد. همیشه منبع‌ها را باز کن و چک کن.", reviewEn: "Great for daily research since it cites sources. Always open and check them." },
    { slug: "make", name: "Make", pricing: "freemium", website: "https://www.make.com", category: "tool-automation", featured: true, sortOrder: 4,
      descFa: "پلتفرم اتوماسیون تصویری برای اتصال اپ‌ها و ساخت فرایند خودکار.", descEn: "Visual automation platform for connecting apps and workflows.",
      useCasesFa: "اتوماسیون فرایندها\nاتصال AI به ابزارها\nگزارش‌گیری خودکار", useCasesEn: "Workflow automation\nConnecting AI to tools\nAuto reporting",
      reviewFa: "بهترین نقطه شروع برای اتوماسیون بدون کدنویسی. پلن رایگان برای شروع کافی است.", reviewEn: "Best no-code start for automation. Free plan is enough to begin." },
    { slug: "notebooklm", name: "NotebookLM", pricing: "free", website: "https://notebooklm.google.com", category: "tool-research", featured: false, sortOrder: 5,
      descFa: "دستیار تحقیق گوگل که فقط از روی مدارک خودت جواب می‌دهد.", descEn: "Google's research assistant that answers only from your docs.",
      useCasesFa: "خلاصه مدارک\nپرسش از روی PDF\nیادگیری", useCasesEn: "Doc summaries\nQ&A over PDFs\nLearning",
      reviewFa: "رایگان و شگفت‌انگیز برای دانشجوها و مهندس‌ها. مدارکت را بده و بپرس.", reviewEn: "Free and amazing for students and engineers. Upload docs and ask." },
    { slug: "elevenlabs", name: "ElevenLabs", pricing: "freemium", website: "https://elevenlabs.io", category: "tool-media", featured: false, sortOrder: 6,
      descFa: "تبدیل متن به گفتار با کیفیت نزدیک به انسان.", descEn: "Near-human text-to-speech.",
      useCasesFa: "تولید پادکست\nدوبله ویدیو\nکتاب صوتی", useCasesEn: "Podcast production\nVideo dubbing\nAudiobooks",
      reviewFa: "بهترین کیفیت صدای AI که تست کرده‌ام؛ برای تولید محتوا عالی است.", reviewEn: "Best AI voice quality I've tested; great for content creation." },
  ];
  for (const t of tools) {
    Tools.upsertBySlug(t.slug, { ...t, categoryId: catId(t.category) } as never);
  }

  // ---------- Projects ----------
  const projects = [
    { slug: "engineering-doc-rag", titleFa: "پرسش‌وپاسخ هوشمند روی مدارک مهندسی (RAG)", titleEn: "Smart Q&A over Engineering Documents (RAG)", featured: true,
      summaryFa: "سیستمی که به‌جای جست‌وجوی دستی در صدها صفحه Spec و Procedure، جواب دقیق با ذکر منبع می‌دهد.", summaryEn: "Instead of manual search across hundreds of spec pages, get precise answers with citations.",
      problemFa: "مهندس‌ها ساعت‌ها وقت صرف پیدا کردن یک بند در مدارک می‌کردند و گاهی نسخه قدیمی را مبنا می‌گرفتند.", problemEn: "Engineers spent hours finding one clause in docs and sometimes used outdated versions.",
      solutionFa: "ساخت سیستم RAG: مدارک تکه‌تکه، ایندکس و قابل پرسش شدند؛ هر جواب با منبع و شماره صفحه.", solutionEn: "Built a RAG system: docs chunked, indexed and queryable; every answer cites source and page.",
      toolsUsed: "Python, LangChain, Vector DB, OpenAI API",
      processFa: "جمع‌آوری مدارک ← پاک‌سازی ← تکه‌تکه‌سازی ← ایندکس ← رابط پرسش ← تست با مهندس‌ها", processEn: "Collect docs → clean → chunk → index → Q&A interface → test with engineers",
      resultFa: "کاهش چشمگیر زمان جست‌وجو و افزایش اطمینان به به‌روز بودن جواب‌ها.", resultEn: "Dramatically faster search and higher confidence in up-to-date answers.",
      lessonsFa: "کیفیت تکه‌تکه‌سازی از مدل مهم‌تر است؛ و همیشه انسان باید جواب نهایی را تایید کند.", lessonsEn: "Chunking quality matters more than the model; a human must always approve final answers." },
    { slug: "content-automation-pipeline", titleFa: "خط تولید محتوای خودکار", titleEn: "Automated Content Pipeline", featured: true,
      summaryFa: "از ایده تا پست آماده انتشار برای اینستاگرام و بلاگ، با نظارت انسانی در حلقه.", summaryEn: "From idea to publish-ready posts for Instagram and blog, with human-in-the-loop review.",
      problemFa: "تولید منظم محتوا زمان‌بر بود و کیفیت با عجله افت می‌کرد.", problemEn: "Consistent content creation was time-consuming and rushed quality dropped.",
      solutionFa: "پایپ‌لاین چندمرحله‌ای: ایده ← پیش‌نویس ← ویرایش ← قالب‌بندی ← بازبینی انسانی ← انتشار.", solutionEn: "Multi-stage pipeline: idea → draft → edit → format → human review → publish.",
      toolsUsed: "ChatGPT API, Make, Notion",
      processFa: "طراحی قالب‌ها ← اتصال ابزارها ← تعریف چک‌لیست کیفیت ← اجرای آزمایشی یک ماهه", processEn: "Design templates → connect tools → define QA checklist → one-month pilot",
      resultFa: "تولید محتوا چند برابر سریع‌تر شد بدون افت کیفیت.", resultEn: "Content output multiplied with no quality drop.",
      lessonsFa: "قالب خوب + بازبینی انسانی = کیفیت پایدار. اتوماسیون بدون بازبینی، اسپم تولید می‌کند.", lessonsEn: "Good templates + human review = lasting quality. Automation without review produces spam." },
    { slug: "shift-report-assistant", titleFa: "دستیار گزارش شیفت صنعتی", titleEn: "Industrial Shift-Report Assistant", featured: false,
      summaryFa: "تبدیل یادداشت‌های پراکنده شیفت به گزارش استاندارد و قابل پیگیری.", summaryEn: "Turning scattered shift notes into standard, trackable reports.",
      problemFa: "گزارش‌های شیفت ناقص و غیراستاندارد بودند و پیگیری کارها سخت بود.", problemEn: "Shift reports were incomplete and non-standard; follow-ups were hard.",
      solutionFa: "فرم هوشمند + AI: یادداشت خام گرفته می‌شود، گزارش ساخت‌یافته با آیتم‌های اقدام تحویل داده می‌شود.", solutionEn: "Smart form + AI: raw notes in, structured report with action items out.",
      toolsUsed: "ChatGPT API, Google Sheets, Telegram Bot",
      processFa: "تحلیل گزارش‌های قبلی ← طراحی قالب ← ساخت نمونه ← آموزش کاربران ← استقرار", processEn: "Analyze old reports → design template → build prototype → train users → deploy",
      resultFa: "گزارش‌ها کامل‌تر و پیگیری‌ها شفاف‌تر شدند.", resultEn: "Reports became complete and follow-ups transparent.",
      lessonsFa: "ساده نگه داشتن برای کاربر نهایی مهم‌تر از هوشمندی سیستم است.", lessonsEn: "Keeping it simple for end users matters more than system cleverness." },
  ];
  for (const p of projects) Projects.upsertBySlug(p.slug, p);

  // ---------- Journey ----------
  const journey = [
    { titleFa: "شروع مسیر علنی: چرا Building in Public؟", titleEn: "Starting in public: why build in public?", kind: "milestone", bodyFa: "تصمیم گرفتم یادگیری و ساختن را علنی کنم. این سایت، قدم اول است: خانه دیجیتال من برای آموزش AI.", bodyEn: "I decided to learn and build in public. This site is step one: my digital home for AI education.", date: "2026-06-01T00:00:00.000Z" },
    { titleFa: "یادگیری RAG و تست روی مدارک واقعی", titleEn: "Learning RAG, testing on real docs", kind: "learning", bodyFa: "دو هفته روی RAG کار کردم و روی مدارک فنی واقعی تست گرفتم. نتیجه: جواب‌های دقیق با ذکر منبع.", bodyEn: "Two weeks on RAG, tested on real technical docs. Result: precise answers with citations.", date: "2026-07-10T00:00:00.000Z" },
    { titleFa: "ساخت اولین ایجنت گزارش‌نویسی", titleEn: "Building my first report-writing agent", kind: "building", bodyFa: "یک ایجنت ساده ساختم که یادداشت خام را به گزارش ساخت‌یافته تبدیل می‌کند. نسخه اول آماده است.", bodyEn: "Built a simple agent turning raw notes into structured reports. V1 is ready.", date: "2026-08-05T00:00:00.000Z" },
    { titleFa: "درس مهم: سادگی از هوشمندی مهم‌تر است", titleEn: "Key lesson: simplicity beats cleverness", kind: "lesson", bodyFa: "در همه پروژه‌ها، سیستمی که ساده و قابل اعتماد بود برد؛ نه سیستمی که پیچیده و «باهوش» بود.", bodyEn: "In every project, the simple trustworthy system won — not the complex 'smart' one.", date: "2026-09-01T00:00:00.000Z" },
  ];
  Journey.clear();
  for (const j of journey) Journey.create(j);

  console.log("Seed done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
