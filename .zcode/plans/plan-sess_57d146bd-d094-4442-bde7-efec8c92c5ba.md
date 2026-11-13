## ساخت روت‌های boom-api بر اساس schema.prisma

### Context
همه‌ی ماژول‌های `src` فعلی استاب خالی هستن، PrismaService وجود نداره، کلاینت Prisma هنوز generate نشده و هیچ زیرساخت auth ای نیست. طبق AGENTS.md از پکیج اول‌party `@nestjs/authentication` استفاده می‌کنم (گارد سراسری JWT، هش پسورد scrypt داخلی، `@CurrentUser`، `@Public`، TokenService) و ولیدیشن با Zod + `StandardSchemaValidationPipe`. گوگل با روش ID Token پیاده می‌شه (فرانت idToken می‌فرسته، بک‌اند با google-auth-library تأییدش می‌کنه).

### پکیج‌های جدید (bun add)
`@nestjs/authentication` · `zod` · `google-auth-library` · `dotenv` (explicit)

### فایل‌های جدید
1. **`src/prisma/prisma.service.ts` + `prisma.module.ts`** — PrismaService با adapter ماریاد‌بی (`PrismaMariaDb` از `@prisma/adapter-mariadb`)، ماژول `@Global()` تا همه‌جا inject بشه. (موقع پیاده‌سازی اسکیل `prisma-driver-adapter-implementation` رو لود می‌کنم برای API دقیق)
2. **`src/common/slug.ts`** — helper تولید slug یکتا برای workspace/project
3. **`src/auth/`** — `auth.module.ts`، `auth.controller.ts` (`@Public`)، `auth.service.ts`، `jwt-bearer.provider.ts` (extends `JwtBearerProvider<User>`، validate با prisma)، `auth.dto.ts` (Zod)
4. فایل‌های dto کوچک Zod داخل هر ماژول

### روت‌ها
| روت | متد | گارد | کار |
|---|---|---|---|
| `/user/me` | GET | ✅ | کاربر جاری بدون password |
| `/plan` | GET | ❌ `@Public` | لیست پلن‌ها |
| `/inbox` | GET | ✅ | نوتیفیکیشن‌های کاربر (جدیدترین اول) |
| `/inbox/read-all` | PATCH | ✅ | همه را خوانده‌شده (`isRead:true, readAt`) و برگردوندن count |
| `/workspace` | GET | ✅ | ورک‌اسپیس‌های کاربر (عضویت + role) |
| `/workspace` | POST | ✅ | ساخت ورک‌اسپیس + عضویت OWNER + slug یکتا |
| `/workspace/:id/permissions` | PATCH | ✅ | آپدیت `allowPublicLinks/allowMemberExport/allowMemberInvites` — فقط OWNER/ADMIN |
| `/project?workspaceId=` | GET | ✅ | پروژه‌های ورک‌اسپیس (بررسی عضویت) |
| `/project/:id` | PATCH | ✅ | تغییر نام (فقط OWNER/ADMIN یا سازنده) |
| `/project/:id` | DELETE | ✅ | حذف نرم (`deletedAt`) با همان چک دسترسی |
| `/auth/login` | POST | ❌ | `{email, password}` → JWT |
| `/auth/register` | POST | ❌ | `{name, email, password}` → JWT |
| `/auth/google` | POST | ❌ | `{idToken}` → تأیید با Google → لاگین یا ساخت خودکار حساب → JWT |
| `/auth/refresh` | POST | ❌ | رفرش توکن (پکیج به‌صورت پیش‌فرض refresh token صادر می‌کند) |

JWT: HS256 با `JWT_SECRET` از env،Issuer/Audience/TTL در `AuthenticationModule.forRootAsync`. کاربران گوگل پسورد تصادفی غیرقابل‌حدس می‌گیرند (چون فیلد password اجباریست). password در هیچ پاسخی برنمی‌گردد (`omit: { password: true }`).

### فایل‌های تغییر کرده
- **`src/main.ts`** — `import 'dotenv/config'`، Swagger (`/api-docs` با DocumentBuilder + addBearerAuth)، global `StandardSchemaValidationPipe`
- **`src/app.module.ts`** — اضافه شدن `AuthenticationModule.forRootAsync`، `PrismaModule`، `AuthModule`؛ **حذف ماژول‌های خالی `src/signin/` و `src/signup/`** (جایگزین‌شان auth شد)؛ هر feature module کنترلر/سرویس خودش را بگیرد
- **`src/app.controller.ts`** — `@Public()` (وگرنه گارد سراسری hello world را 401 می‌کند)
- کنترلر/سرویس‌های user, plan, inbox, workspace, project — پیاده‌سازی روت‌های جدول بالا
- **`.env`** — افزودن `JWT_SECRET` (≥32 کاراکتر) و `GOOGLE_CLIENT_ID`

### قواعد پروژه
ESM: ایمپورت‌های نسبی با `.js` · quote تک‌پرایم · Vitest (mock با `vi.fn()`) · خطای no-floating-promises رعایت شود

### Verification
1. `bunx prisma generate` (کلاینت الان وجود ندارد)
2. `bunx prisma db push` اگر MySQL لوکال بالا بود (اگر نبود اطلاع می‌دهم)
3. `bun run build` و `bun run lint`
4. اجرای `bun run start:dev` و تست فلو با curl: register → توکن → `/user/me` با Bearer → ساخت workspace → پروژه‌ها → inbox
5. بررسی Swagger در `http://localhost:3001/api-docs`