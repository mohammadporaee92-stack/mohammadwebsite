import { Settings, Cats, Articles, Courses, Tools, run, db } from "../db";
import { BRAND_DEFAULTS } from "../brand";
import { guides } from "./guides";
import legacy from "./legacy.json";

// Additive and idempotent: lesson IDs, progress and admin edits survive reruns.
export async function runBaseSeed() {
  db.exec("BEGIN IMMEDIATE");
  try {
    const upgraded = Settings.get("brand_launch_v2") === "1";
    if (!upgraded) {
      // Keep the old bundled examples as drafts; retain every row and lesson ID.
      for (const slug of legacy.articles) run("UPDATE articles SET status = 'draft' WHERE slug = ?", slug);
      for (const slug of legacy.courses) run("UPDATE courses SET status = 'draft' WHERE slug = ?", slug);
      for (const slug of legacy.projects) run("UPDATE projects SET status = 'draft' WHERE slug = ?", slug);
      for (const title of ["Starting in public: why build in public?", "Learning RAG, testing on real docs", "Building my first report-writing agent", "Key lesson: simplicity beats cleverness"]) {
        run("UPDATE journey_entries SET status = 'draft' WHERE titleEn = ?", title);
      }
      for (const slug of ["chatgpt", "claude", "perplexity", "make", "notebooklm", "elevenlabs"]) {
        run("UPDATE tools SET status = 'draft' WHERE slug = ?", slug);
      }
      for (const [key, value] of Object.entries(BRAND_DEFAULTS)) Settings.set(key, value);
    }
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

    for (const c of cats) if (!Cats.bySlug(c.slug)) Cats.upsert(c);
    const catId = (slug: string) => Cats.bySlug(slug)!.id;
    for (const g of guides) if (!Articles.bySlug(g.slug)) {
      const { category, ...content } = g;
      Articles.upsertBySlug(g.slug, {
        ...content, categoryId: catId(category), kind: "tutorial",
        status: "published", difficulty: "beginner", authorName: "Mohammad Poraee", views: 0,
      });
    }
    if (!Articles.bySlug("learn-ai-one-task")) Articles.upsertBySlug("learn-ai-one-task", {
      titleFa: "یادگیری AI را با یک کار واقعی شروع کن",
      titleEn: "Start learning AI with one real task",
      excerptFa: "یک مسئله کوچک و قابل بررسی، نقطه شروع خوبی برای یادگیری است.",
      excerptEn: "One small, checkable task is a useful starting point.",
      contentFa: "## از کجا شروع کنیم؟\nلازم نیست همه ابزارها را بشناسی. یک کار کوچک انتخاب کن: بازنویسی یک پیام، خلاصه‌کردن یک متن عمومی یا مرتب‌کردن یک فهرست کار.\n## چرخه یادگیری\n1. نتیجه موردنظرت را بنویس.\n2. درخواست روشنی به دستیار بده.\n3. خروجی را بررسی کن.\n4. یک نکته را اصلاح و دوباره امتحان کن.\n## یک دفترچه ساده\nدرخواست اولیه، نتیجه و چیزی را که تغییر دادی نگه دار. دفعه بعد می‌توانی از تجربه خودت استفاده کنی.\n## مسیر PorAI\nاین سایت با آموزش‌های متنی برای افراد علاقه‌مند شروع می‌شود. هدف، یادگیری کاربردی هوش مصنوعی و اتوماسیون با قدم‌های کوچک و نتیجه قابل بررسی است.",
      contentEn: "## Where should you start?\nYou do not need to know every tool. Choose one small task: rewrite a message, summarize a public text or organize a task list.\n## A learning loop\n1. Describe the result you want.\n2. Give the assistant clear instructions.\n3. Check the output.\n4. Change one thing and try again.\n## Keep a simple notebook\nSave the first prompt, the result and what you changed. That record helps you reuse your own learning next time.\n## The PorAI approach\nThis site starts with written lessons for curious beginners. The goal is to learn practical AI and automation through small steps and checkable results.",
      kind: "article", status: "published", categoryId: catId("artificial-intelligence"), readMinutes: 3, authorName: "Mohammad Poraee", views: 0,
    });
    if (!Courses.bySlug("ai-from-zero")) {
      const course = Courses.upsertBySlug("ai-from-zero", {
        titleFa: "شروع از صفر با هوش مصنوعی", titleEn: "Practical AI from Zero",
        descFa: "یک دوره متنی رایگان با شش درس کوتاه و تمرین‌های روزمره. آموزش‌ها بدون نیاز به ثبت‌نام قابل مطالعه‌اند؛ با حساب کاربری می‌توانی پیشرفتت را ذخیره کنی.",
        descEn: "A free written course with six short lessons and everyday exercises. Read without signing in; use an account to save your progress.",
        outcomesFa: "شناخت کاربرد و محدودیت AI\nنوشتن درخواست روشن\nخلاصه‌سازی و بررسی خروجی\nطراحی یک فرایند تکرارشونده",
        outcomesEn: "Understand AI uses and limits\nWrite clear requests\nSummarize and verify outputs\nMap a repeatable workflow",
        audienceFa: "افراد علاقه‌مند به AI که می‌خواهند از صفر شروع کنند.",
        audienceEn: "Curious people who want to start learning AI from zero.",
        prereqFa: "مهارت مقدماتی کار با مرورگر؛ بدون نیاز به برنامه‌نویسی.",
        prereqEn: "Basic browser skills. No programming background required.",
        priceType: "free", level: "beginner", status: "published", featured: true,
        categoryId: catId("course-starter"), instructor: "Mohammad Poraee", lang: "both",
      });
      const module = Courses.createModule(course.id, { titleFa: "از اولین درخواست تا نقشه اتوماسیون", titleEn: "From your first prompt to an automation plan" });
      for (const g of guides) Courses.createLesson(module.id, {
        titleFa: g.titleFa, titleEn: g.titleEn, bodyFa: g.contentFa, bodyEn: g.contentEn,
        durationMin: g.readMinutes, isFree: true,
      });
    }
    const toolEntries = [
      { slug: "chatgpt-starter", name: "ChatGPT", website: "https://chatgpt.com/", category: "tool-chat",
        descFa: "دستیار گفت‌وگویی برای توضیح مفاهیم، نوشتن پیش‌نویس و ایده‌پردازی.",
        descEn: "A conversational assistant for explaining concepts, drafting text and exploring ideas.",
        useCasesFa: "تمرین نوشتن\nتوضیح مفاهیم\nخلاصه‌سازی", useCasesEn: "Writing practice\nConcept explanations\nSummaries",
        reviewFa: "یک متن غیرخصوصی بده و خروجی را با اصل متن مقایسه کن. معرفی قابلیت‌ها: [صفحه رسمی ChatGPT](https://chatgpt.com/overview/).",
        reviewEn: "Try a non-private text and compare the output with the original. Capabilities: [official ChatGPT overview](https://chatgpt.com/overview/)." },
      { slug: "claude-starter", name: "Claude", website: "https://claude.ai/", category: "tool-chat",
        descFa: "دستیار هوش مصنوعی برای کار با متن، نوشتن و حل مسئله.",
        descEn: "An AI assistant for working with text, writing and problem solving.",
        useCasesFa: "بازنویسی متن\nمرور یادداشت\nتوضیح مسئله", useCasesEn: "Rewriting\nReviewing notes\nExplaining problems",
        reviewFa: "یک درخواست مشخص بنویس و پاسخ را بررسی کن. منبع معرفی: [صفحه رسمی Claude](https://claude.com/product/overview).",
        reviewEn: "Try a specific request and review the result. Source: [official Claude overview](https://claude.com/product/overview)." },
      { slug: "make-starter", name: "Make", website: "https://www.make.com/en", category: "tool-automation",
        descFa: "ابزار بصری برای اتصال برنامه‌ها و تعریف مراحل فرایند خودکار.",
        descEn: "A visual tool for connecting applications and defining automated workflows.",
        useCasesFa: "اتصال برنامه‌ها\nکارهای تکراری\nطراحی فرایند", useCasesEn: "Connecting apps\nRecurring tasks\nWorkflow design",
        reviewFa: "ابتدا ورودی، خروجی و مسیر خطا را مشخص کن. سرویس‌های متصل ممکن است هزینه جدا داشته باشند. منبع: [سایت رسمی Make](https://www.make.com/en).",
        reviewEn: "Map inputs, outputs and failure handling first. Connected services may have separate costs. Source: [official Make site](https://www.make.com/en)." },
    ];
    for (const t of toolEntries) if (!Tools.bySlug(t.slug)) {
      const { category, ...content } = t;
      Tools.upsertBySlug(t.slug, { ...content, categoryId: catId(category), status: "published", pricing: "check_provider", featured: true });
    }
    if (!upgraded) Settings.set("brand_launch_v2", "1");
    db.exec("COMMIT");
    console.log("Brand edition ready: six guides, one text course; existing records preserved.");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
