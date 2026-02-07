## Project Overview (English)

### 1. Project Name and Purpose
- **Name**: Ramadan Cards 2026  
- **Goal**: A web app for creating beautiful, personalized Ramadan and Eid greeting cards that you can design directly in the browser and download as an image.
- **Target users**: Muslims and anyone who wants to share Ramadan/Eid greetings with friends and family in a modern, visual way.

### 2. Main Features
- **Home page**
  - Beautiful Ramadan-themed hero section with animated Islamic illustration.
  - Short educational sections about **Islam**, **Ramadan**, **fasting**, **Eid**, **prayer**, and **charity**.
  - **Ramadan countdown** section showing the time left until Ramadan.
  - **Card templates** section showcasing ready-made card designs and a button to jump to the editor.

- **Card Editor page**
  - **Canvas-based editor** where the user designs a Ramadan/Eid card.
  - **Add / edit text**:
    - Add new text boxes.
    - Update text content, fonts, sizes, colors, alignment, and other text properties.
  - **Stickers**:
    - Open a sticker picker and add themed stickers (crescent moon, lanterns, etc.) onto the card.
  - **Dua bar**:
    - A bar with pre-defined **duas (supplications)** that you can insert as text into the card.
  - **Templates**:
    - Apply pre-designed templates (background + layout) from the templates panel.
  - **Background control**:
    - Change the background color or apply a template background.
  - **Layers / arrangement**:
    - Bring an element forward or send it backward in the z-order.
  - **Selection & manipulation**:
    - Select elements on the canvas.
    - Move, resize, rotate, duplicate, and delete elements.
  - **Undo / redo**:
    - Full undo/redo support (including keyboard shortcuts).
  - **Download as image**:
    - Export the designed card as a PNG image using `html-to-image` with careful handling for fonts, stickers, and background.

- **Internationalization & RTL**
  - **Languages**: English and Arabic (via `i18next` and `react-i18next`).
  - **RTL support**: Layout and text direction react to the selected language using a custom `useLanguage` hook.
  - **Language switcher** component in the editor header and translations for all main UI texts.

### 3. Tech Stack
- **Framework**: React
- **Language**: TypeScript
- **Build tool**: Vite
- **Styling**: Tailwind CSS + custom CSS components
- **Routing**: `react-router-dom`
- **Animations**: `framer-motion` and Lottie-based Islamic animation (`@lottiefiles/dotlottie-react`)
- **Internationalization**: `i18next` + `react-i18next`
- **Icons**: `react-icons`
- **Image export**: `html-to-image` (and `html2canvas` included)
- **Linting**: ESLint with TypeScript and React presets

### 4. Main Project Structure
- **Root**
  - `PROJECT_OVERVIEW.md`: This bilingual project overview.
  - `README.md`: Generic starter README (React + TypeScript + Vite template).
  - `package.json`: Scripts and dependencies.
  - `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `tailwind.config.js`, `postcss.config.js`: Tooling configuration.

- **Public assets**
  - `public/assets/backgrounds`: Background images and textures for cards.
  - `public/assets/templates`: Base template images used by the editor.
  - `public/assets/stickers`: Ramadan/Eid-themed stickers (SVGs and PNGs).
  - `public/assets/fonts` and `public/assets/new-fonts`: Arabic and Latin fonts used in the UI and on cards.

- **Source code (`src`)**
  - `main.tsx`:
    - Application entry point.
    - Sets up React, routing, and wraps the app with providers (including i18n).
  - `App.tsx`:
    - Main app component.
    - Defines routes (e.g., `/` for `Home`, `/editor` for the card editor).

  - **Pages**
    - `pages/Home.tsx`:
      - Landing page with hero section, informational sections, countdown, and template preview.
    - `pages/Editor.tsx`:
      - Full-screen editor page with:
        - Header (title, language switcher, download button).
        - Left sidebar (tools: add text, stickers, future image/background tools).
        - Main canvas area.
        - Right sidebar (text controls, background controls, templates, layer actions, duplicate/delete).

  - **Components**
    - `components/Editor/*`:
      - `Canvas`: Core drawing/editing surface; renders text, stickers, and background.
      - `TextControls`: Controls for font, size, color, alignment, etc.
      - `BackgroundControls`: Change background color or image.
      - `TemplatesPanel`: List of predefined templates to apply.
      - `StickerPicker`: Sticker gallery.
      - `DuaBar`: Horizontal bar listing duas; clicking adds them to the canvas as text.
    - `components/Templates/CardsTemplateSection.tsx`:
      - Displays available card templates on the home page and links to the editor.
    - `components/UI/*`:
      - `Navbar`, `Footer`: Main layout components.
      - `BackgroundPattern`: Subtle Islamic-themed background for the home page.
      - `IslamicAnimation`: Lottie-based decorative animation.
      - `RamadanCountdown`: Countdown timer component.
      - `LanguageSwitcher`: Switch between English and Arabic.
      - `SidebarButton`, `Button`, `UndoRedoContainer`, and other reusable UI primitives.

  - **Data**
    - `data/templates.ts`: Template metadata (ids, images, configuration) used by the editor and template sections.
    - `data/stickers.ts`: List of available stickers with their image paths.
    - `data/duas.ts`: List of duas (Arabic/translated texts) used in the `DuaBar`.
    - `data/greetings.ts`: Predefined greetings or text snippets for cards.

  - **Hooks**
    - `hooks/useEditor.ts`:
      - Central state management for the editor.
      - Handles adding/selecting/moving/resizing/rotating elements, applying templates, undo/redo, duplicate, delete, and background changes.
    - `hooks/useLanguage.ts`:
      - Manages current language, text direction (LTR/RTL), and provides translation helpers.

  - **Internationalization**
    - `i18n/config.ts`:
      - i18next configuration (languages, resources, default language).
    - `i18n/locales/*.json`:
      - Translation files for English and Arabic (hero texts, info cards, editor labels, buttons, etc.).

  - **Types & Utilities**
    - `types/editor.ts`, `types/dua.ts`, `types/stickers.ts`:
      - TypeScript types/interfaces for editor elements, duas, stickers, etc.
    - `utils/*`:
      - `download.ts`, `measureTextWidth.ts`, `generateId.ts`, `clamp.ts`, `ScrollToTopButton.tsx`, and other small helpers.
    - `constants/fonts.ts`:
      - Font definitions and mappings used in the editor.

### 5. How the App Works (Flow)
- **1. User opens the home page (`/`)**
  - Sees the hero section, educational info, countdown, and a selection of card templates.
  - Clicks the main CTA button or a template action to go to the editor.
- **2. User designs a card in the editor (`/editor`)**
  - Adds text, stickers, and duas; changes background or applies a template.
  - Adjusts layout, layer order, and styles.
- **3. User downloads the card**
  - Presses the download button in the editor header.
  - The app waits for images, fonts, and background to be ready, converts the card to PNG, and triggers a download (`ramadan-card.png`).
- **4. User shares the card**
  - The downloaded image can be shared via messaging apps, social networks, or printed.

---

## نظرة عامة على المشروع (العربية)

### 1. اسم المشروع وهدفه
- **الاسم**: بطاقات رمضان 2026  
- **الهدف**: تطبيق ويب لإنشاء بطاقات تهنئة رمضان وعيد جميلة وشخصية يمكن تصميمها مباشرة من المتصفح ثم حفظها كصورة.
- **المستخدمون المستهدفون**: المسلمون وكل من يرغب في مشاركة تهاني رمضان والعيد مع الأهل والأصدقاء بطريقة عصرية وجذابة.

### 2. أهم المميزات
- **الصفحة الرئيسية**
  - قسم ترحيبي (Hero) بتصميم رمضاني أنيق ورسوم إسلامية متحركة.
  - أقسام تعريفية قصيرة عن **الإسلام**، **رمضان**، **الصيام**، **العيد**، **الصلاة**، و**الصدقة**.
  - قسم **العد التنازلي لرمضان** يوضح الوقت المتبقي لبداية الشهر.
  - قسم **قوالب البطاقات** يعرض نماذج جاهزة مع زر للانتقال إلى صفحة المحرر.

- **صفحة محرر البطاقات**
  - **محرر مبني على لوحة (Canvas)** لتصميم بطاقة رمضان/العيد.
  - **إضافة وتعديل النصوص**:
    - إضافة مربعات نص جديدة.
    - تعديل المحتوى، الخط، الحجم، اللون، المحاذاة، وغيرها من خصائص النص.
  - **الملصقات (Stickers)**:
    - فتح قائمة ملصقات وإضافة رموز وزخارف رمضانية (هلال، فوانيس، إلخ) إلى البطاقة.
  - **شريط الأدعية (Dua Bar)**:
    - قائمة أدعية جاهزة يمكنك إدراجها كنص على البطاقة بضغطة واحدة.
  - **القوالب (Templates)**:
    - تطبيق قوالب جاهزة (خلفية + توزيع عناصر) من لوحة القوالب.
  - **التحكم في الخلفية**:
    - تغيير لون الخلفية أو استخدام خلفية من القوالب.
  - **الطبقات (Layers)**:
    - تقديم عنصر للأمام أو إرساله للخلف في ترتيب العناصر.
  - **التحديد والتحريك**:
    - تحديد العناصر على اللوحة، تحريكها، تغيير حجمها، تدويرها، نسخها أو حذفها.
  - **التراجع والإعادة (Undo/Redo)**:
    - دعم كامل للتراجع والإعادة مع اختصارات لوحة المفاتيح.
  - **التحميل كصورة**:
    - تصدير التصميم كصورة PNG باستخدام `html-to-image` مع مراعاة تحميل الخطوط والخلفيات والملصقات بشكل صحيح.

- **تعدد اللغات ودعم الاتجاه من اليمين لليسار**
  - **اللغات المدعومة**: العربية والإنجليزية باستخدام `i18next` و`react-i18next`.
  - **دعم الاتجاه RTL**: يتغير اتجاه النص والمحاذاة وتصميم بعض العناصر حسب اللغة المختارة باستخدام الـ hook المخصص `useLanguage`.
  - **محوّل اللغة** في شريط العنوان بالمحرر، مع ترجمات لمعظم نصوص الواجهات والأزرار.

### 3. التقنيات المستخدمة
- **إطار العمل**: React
- **اللغة**: TypeScript
- **أداة البناء**: Vite
- **التصميم**: Tailwind CSS مع ملفات CSS مخصّصة
- **إدارة المسارات**: `react-router-dom`
- **الأنيميشن**: `framer-motion` ورسوم Lottie (`@lottiefiles/dotlottie-react`)
- **تعدد اللغات**: `i18next` + `react-i18next`
- **الأيقونات**: `react-icons`
- **تصدير الصور**: `html-to-image` (و`html2canvas` مضافة أيضاً)
- **فحص الكود (Linting)**: ESLint مع إعدادات React وTypeScript

### 4. الهيكل العام للمشروع
- **الجذر**
  - `PROJECT_OVERVIEW.md`: ملف النظرة العامة ثنائي اللغة (إنجليزي/عربي).
  - `README.md`: ملف تمهيدي عام لقالب React + TypeScript + Vite.
  - `package.json`: معلومات المشروع والسكربتات والاعتمادات (dependencies).
  - ملفات الإعداد مثل: `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `tailwind.config.js`, `postcss.config.js`.

- **ملفات وأصول عامة (Public)**
  - `public/assets/backgrounds`: خلفيات وصور لخلفية البطاقات.
  - `public/assets/templates`: صور القوالب الأساسية المستخدمة في المحرر.
  - `public/assets/stickers`: ملصقات رمضان والعيد (SVG وPNG).
  - `public/assets/fonts` و`public/assets/new-fonts`: خطوط عربية وإنجليزية لواجهة المستخدم وللنصوص على البطاقات.

- **كود المصدر (`src`)**
  - `main.tsx`:
    - نقطة الدخول للتطبيق.
    - تهيئة React، الراوتر، ومزوّدات السياق (مثل i18n).
  - `App.tsx`:
    - المكوّن الرئيسي للتطبيق.
    - تعريف المسارات (مثلاً `/` للصفحة الرئيسية و`/editor` لمحرر البطاقات).

  - **الصفحات (Pages)**
    - `pages/Home.tsx`:
      - الصفحة الرئيسية التي تحتوي على القسم الترحيبي، الأقسام التعريفية، العد التنازلي، ومعاينة القوالب.
    - `pages/Editor.tsx`:
      - صفحة المحرر الكاملة، وتضم:
        - ترويسة (عنوان، محوّل لغة، زر تحميل).
        - شريط جانبي يسار (أدوات: إضافة نص، ملصقات، وأدوات أخرى مستقبلية للصور/الخلفية).
        - منطقة اللوحة (Canvas).
        - شريط جانبي يمين (أدوات التحكم بالنص، الخلفية، القوالب، الطبقات، النسخ والحذف).

  - **المكوّنات (Components)**
    - `components/Editor/*`:
      - `Canvas`: اللوحة الأساسية التي ترسم النصوص والملصقات والخلفية.
      - `TextControls`: أدوات التحكم بخيارات النص.
      - `BackgroundControls`: أدوات تغيير الخلفية.
      - `TemplatesPanel`: قائمة القوالب الجاهزة.
      - `StickerPicker`: معرض الملصقات.
      - `DuaBar`: شريط الأدعية لإضافتها بسرعة إلى التصميم.
    - `components/Templates/CardsTemplateSection.tsx`:
      - عرض قوالب البطاقات في الصفحة الرئيسية مع أزرار للانتقال إلى المحرر.
    - `components/UI/*`:
      - `Navbar`, `Footer`: عناصر واجهة أساسية للتنقل والهوامش.
      - `BackgroundPattern`: نمط خلفية إسلامي خفيف للصفحة الرئيسية.
      - `IslamicAnimation`: رسوم متحركة باستخدام Lottie.
      - `RamadanCountdown`: عدّاد تنازلي لرمضان.
      - `LanguageSwitcher`: مكوّن لتبديل اللغة.
      - `SidebarButton`, `Button`, `UndoRedoContainer` وغير ذلك من مكوّنات الواجهة القابلة لإعادة الاستخدام.

  - **البيانات (Data)**
    - `data/templates.ts`: بيانات القوالب (معرّفات، صور، إعدادات) المستخدمة في المحرر والصفحة الرئيسية.
    - `data/stickers.ts`: قائمة الملصقات مع مسارات الصور.
    - `data/duas.ts`: قائمة الأدعية المستخدمة في `DuaBar`.
    - `data/greetings.ts`: عبارات تهنئة جاهزة يمكن استخدامها في البطاقات.

  - **Hooks مخصّصة**
    - `hooks/useEditor.ts`:
      - إدارة حالة المحرر بالكامل.
      - التحكم في إضافة/تحديد/تحريك/تغيير حجم/تدوير العناصر، تطبيق القوالب، التراجع/الإعادة، النسخ، الحذف، وتغيير الخلفية.
    - `hooks/useLanguage.ts`:
      - إدارة اللغة الحالية، اتجاه النص (LTR/RTL)، وتوفير دوال مساعدة للترجمة.

  - **الترجمة (i18n)**
    - `i18n/config.ts`:
      - إعداد مكتبة i18next (اللغات، الموارد، اللغة الافتراضية).
    - `i18n/locales/*.json`:
      - ملفات الترجمة باللغتين العربية والإنجليزية لنصوص الواجهة والعناوين والأزرار.

  - **الأنواع والأدوات (Types & Utilities)**
    - `types/editor.ts`, `types/dua.ts`, `types/stickers.ts`:
      - أنواع/واجهات TypeScript لعناصر المحرر والأدعية والملصقات وغيرها.
    - `utils/*`:
      - ملفات مساعدة مثل: `download.ts`, `measureTextWidth.ts`, `generateId.ts`, `clamp.ts`, و`ScrollToTopButton.tsx`.
    - `constants/fonts.ts`:
      - تعريفات الخطوط وربطها بالمحرر.

### 5. طريقة عمل التطبيق (تسلسل الاستخدام)
- **1. فتح الصفحة الرئيسية (`/`)**
  - يشاهد المستخدم القسم الترحيبي، الأقسام التعريفية، العد التنازلي، وبعض القوالب الجاهزة.
  - يمكنه الضغط على زر البدء أو أحد القوالب للانتقال إلى صفحة المحرر.
- **2. تصميم البطاقة في صفحة المحرر (`/editor`)**
  - يضيف نصوصاً وملصقات وأدعية، ويغيّر الخلفية أو يطبّق قالباً جاهزاً.
  - يحرّك العناصر ويعدّل ترتيبها وشكلها حتى يصل للتصميم المطلوب.
- **3. تحميل البطاقة**
  - يضغط المستخدم على زر التحميل في أعلى الصفحة.
  - ينتظر التطبيق حتى تجهز الخطوط والصور والخلفية، ثم يحوّل البطاقة إلى صورة PNG ويحفظها باسم `ramadan-card.png`.
- **4. مشاركة البطاقة**
  - يمكن للمستخدم بعد ذلك مشاركة الصورة عبر تطبيقات المحادثة أو وسائل التواصل الاجتماعي أو طباعتها.

