import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('he', () => Promise.resolve({
    // ----- Header / general -----
    welcome: "יוצאים לחירות",
    app_description: "מוכיחים שעולם חדש הוא אפשרי",
    about: "אודות",
    contact_us: "צור קשר",
    connected: "מחוברים",
    back_home: "חזרה לדף הבית",
    all_rights_reserved: "כל הזכויות שמורות",
    choose_language: "בחר שפה",

    // ----- Layout -----
    layout: {
        skip_to_main: "דלג לתוכן הראשי",
    },

    // ----- Footer -----
    footer: {
        brand: "יוצאים לחירות",
        brand_aria: "יוצאים לחירות (נפתח בחלון חדש)",
        bottom_nav_aria: "ניווט תחתון",
        terms_part1: "תנאי שימוש",
        terms_part2: "הצהרת נגישות וכו'",
        contact_email_aria: "צור קשר – שלח אימייל",
        leaders_part1: "דרושים מנהיגים",
        leaders_part2: "ומתנדבים",
    },

    // ----- Page (home) -----
    page: {
        hero_title: "יוצאים לחירות",
        intro: {
            movement_label: "יוצאים לחירות -",
            movement_text: "הינה תנועה חברתית, העוסקת לקדם ולשפר את החברה בישראל לחברה יותר אחראית, סולידרית וחופשיה. התנועה עוסקת לשחרר את התושבים מריכוזי הכח הנמצאים היום אצל קומץ השולטים בבנקים, בתקשורת, בכלכלה, בפוליטיקה וברשויות המדינה.",
            vision_label: "החזון -",
            vision_text: "התאחדות התושבים, ביזור הכח הריכוזי שבמוסדות המדינה, פיקוח, ביקורת, ומעורבות של העם בקבלת ההחלטות.",
            activity_label: "הפעילות -",
            activity_text: "יוצאים לחירות פיתחה אפליקציות המקדמות את המשילות, הקימה רכזים חברתיים בשכונות ברחבי הארץ, וקהילה גדולה המקדמת את ערכי החופש, האחווה, והמשילות של העם על מוסדותיו!",
        },
        video: {
            title: "יוצאים לחירות",
            play_aria: "נגן את הסרטון יוצאים לחירות",
        },
        members: {
            prefix: "יוצאים לחירות מונה",
            suffix: "חברים וממשיכים לעלות!",
        },
        platforms_title: "מודל המשילות של העם, מתפקד ומתקדם על ידי רשת של כלים ופלטפורמות חדשניות:",
        columns: {
            community: "קהילה",
            governance: "משילות",
            economy: "כלכלה",
        },
        sites: {
            community_neighborhood: {
                title: "קהילה בשכונה",
                description: "מגבשים את התושבים ומפתחים כל שכונה לקהילה תומכת, מתקשרת ומשגשגת, על בסיס ואהבת לרעך כמוך.",
            },
            courts_reconciliation: {
                title: "בתי דין ופיוס",
                description: "מסייעים לפתור סיכסוכים ובעיות, במהירות וביעילות, מחזקים את הצדק בארץ.",
            },
            national_gemach: {
                title: 'הגמ"ח הארצי',
                description: "מנגישים את הגמחים בארץ, תורמים ומחזקים איש את רעהו.",
            },
            neighborhood_committees: {
                title: "ועדי שכונות",
                description: "וועדי שכונות מאוחדים, נאבקים על זכויות העם מול הרשויות, מקדמים עצמאות, פרטיות וחירות כלכלית.",
            },
            state_auditor: {
                title: "מבקר רשויות המדינה",
                description: "העם: מבקר, חושף שחיתויות, מפקח על רשויות המדינה ופונה בשם התושב למיצוי זכויותיו המלאות.",
            },
            public_rating: {
                title: "דירוג ציבורי",
                description: "מפרסמים את פעולות עובדי הציבור ומדרגים את יעילותם.",
            },
            experts: {
                title: "המומחים",
                description: "מומחים בכל תחום מתוועדים ומתדיינים, מציעים פתרונות ומקדמים את המדינה צעד קדימה.",
            },
            referendum: {
                title: "משאלי העם",
                description: "מצביעים ומביעים את דעת הקהל בסוגיות הארציות!",
            },
            purchasing_group: {
                title: "קבוצת רכישה",
                description: "הצטרף לקבוצת הרכישה שלנו והוזל מיד את ההוצאות!",
            },
            group_investments: {
                title: "השקעות קבוצתיות",
                description: "התחבר עם קבוצת המשקיעים החברתית שלנו.",
            },
            professionals: {
                title: "בעלי המקצוע שלנו",
                description: "מאתרים בקלות בעלי מקצוע כשירים שחתמו על תנאי הקהילה שלנו ונותנים רק לנו הטבות כלכליות.",
            },
            freedom_store: {
                title: "חנות החירות",
                description: "החנות שתומכת בחירות התושב: בריאות טבעית, חקלאות ביתית, טכנולוגיה מתקדמת ועוד.",
            },
        },
        banner: {
            go_to_site: "עבור אל האתר ←",
        },
        news_block: {
            tagline: "התקשורת שלנו עצמאית - מסקרים את אירועי המדינה מזווית זכות התושב!",
            image_alt: "חדשות",
        },
        socials: {
            title: "עקבו אחרינו ברשתות החברתיות",
        },
    },

    // ----- Sidebar (AdsSidebar) -----
    sidebar: {
        aria_label: "פרסומות ושותפים",
        heading: "מתקדמים לחברה מתוקנת ועצמאית",
        opens_new_window: " (נפתח בחלון חדש)",
    },

    // ----- Right ad banner -----
    right_ads: {
        aria_label: "פרסומות",
        heading: "תוכן שיווקי",
        slot_text: "מקום פרסום",
        slot_desc: "יכול להיות שלך",
        cta_details: "לפרטים",
        this_word: "זה",
    },

    // ----- Mobile drawer -----
    drawer: {
        close_ads_aria: "סגור פרסומות",
        dialog_aria: "האזור האישי וההטבות מהקהילה הארצית",
        personal_area: "האזור האישי",
        close: "סגור",
        personal_messages: "📩 הודעות אישיות",
        to_personal_area: "לאזור האישי ←",
        my_personal_area: "לאזור האישי שלי ←",
        your_personal_area: "לאזור האישי שלך ←",
        login_register: "התחברות / הרשמה",
        wallet_alt: "ארנק",
        benefits_title: "הטבות ארציות",
        ad_slot_title: "מקום פרסום",
        ad_slot_sub: "לחץ לפרסם כאן",
        open_tab_aria: "פתח הטבות לקהילה",
        tab_text: "לאזור האישי ולהטבות",
    },

    // ----- Ads data (adsData.ts) -----
    ads: {
        social_store: {
            title: "החנות החברתית",
            description: "מוצרים נבחרים לבריאות טבעית, חקלאות ביתית, טכנולוגיה ועוד",
            cta: "כנסו לחנות לחיים טובים יותר",
            hover: "החנות שלנו!",
        },
        peace_houses: {
            title: "בתי הפיוס",
            description: "מתנדבים לתת לך עזרה מלאה בדין / פיוס בכל סיכסוך",
            cta: "יש לך סיכסוך? לחץ לפתרון",
        },
        national_gemach: {
            title: 'הגמ"ח הארצי',
            description: "כל הגמחים תחת קורת גג אחת",
            cta: 'לאתר הגמ"ח הארצי',
            hover: "מצא כל גמח בקלות!",
        },
        neighborhood_committees: {
            title: "ועדי שכונות",
            description: "מהפכת משילות העם על המוסדות",
            cta: "הכר והשתתף במהפכת משילות העם על מוסדותיו",
        },
        state_auditor: {
            title: "מבקר רשויות המדינה",
            description: "מבקרים את הרשויות, ממצים את זכות התושב",
            cta: "מבקרים את הרשויות, ממצים את זכות התושב",
        },
        public_rating: {
            title: "דירוג ציבורי",
            description: "העם מדרג את הרשויות ועובדי הציבור",
            cta: "העם מדרג את הרשויות ועובדי הציבור",
        },
        referendum: {
            title: "משאלי העם",
            description: "הבע דעתך על הסוגיות האקטואליות",
            cta: "הבע דעתך על הסוגיות האקטואליות",
            hover: "הבע דעתך על הסוגיות האקטואליות",
        },
        purchasing_group: {
            title: "קבוצת רכישה",
            description: "הוזל את ההוצאות שלך",
            cta: "הצטרף לקבוצת הרכישה שלנו והוזל מיד את ההוצאות!",
        },
        investors_club: {
            title: "מועדון המשקיעים החברתי",
            description: "התחבר עם קבוצת המשקיעים שלנו",
            cta: "התחבר עם קבוצת המשקיעים שלנו",
        },
        professionals: {
            title: "בעלי מקצוע כשירים",
            description: "חתמו על תנאי הקהילה ונותנים לנו הנחות והטבות יחודיות",
            cta: "מחפש בעל מקצוע איכותי באזורך?",
        },
    },
}));

register('en', () => Promise.resolve({
    // ----- Header / general -----
    welcome: "Going to Freedom",
    app_description: "Proving a new world is possible",
    about: "About",
    contact_us: "Contact Us",
    connected: "Online",
    back_home: "Back to Home",
    all_rights_reserved: "All rights reserved",
    choose_language: "Choose language",

    // ----- Layout -----
    layout: {
        skip_to_main: "Skip to main content",
    },

    // ----- Footer -----
    footer: {
        brand: "Going to Freedom",
        brand_aria: "Going to Freedom (opens in a new window)",
        bottom_nav_aria: "Footer navigation",
        terms_part1: "Terms of Use",
        terms_part2: "Accessibility Statement & more",
        contact_email_aria: "Contact us – send an email",
        leaders_part1: "Leaders & volunteers",
        leaders_part2: "wanted",
    },

    // ----- Page (home) -----
    page: {
        hero_title: "Going to Freedom",
        intro: {
            movement_label: "Going to Freedom -",
            movement_text: "is a social movement working to advance and improve Israeli society into a more responsible, solidary, and free society. The movement works to liberate residents from the concentrations of power currently held by a handful of people who control the banks, the media, the economy, politics, and state authorities.",
            vision_label: "The Vision -",
            vision_text: "Uniting residents, decentralizing the concentrated power within state institutions, oversight, audit, and public involvement in decision-making.",
            activity_label: "Our Work -",
            activity_text: "Going to Freedom has built applications that advance governance, established neighborhood community coordinators across the country, and grown a large community that promotes the values of freedom, fellowship, and the people's governance over its institutions!",
        },
        video: {
            title: "Going to Freedom",
            play_aria: "Play the Going to Freedom video",
        },
        members: {
            prefix: "Going to Freedom now has",
            suffix: "members - and growing!",
        },
        platforms_title: "The people's governance model, powered and advanced by a network of innovative tools and platforms:",
        columns: {
            community: "Community",
            governance: "Governance",
            economy: "Economy",
        },
        sites: {
            community_neighborhood: {
                title: "Community in Your Neighborhood",
                description: "The Going to Freedom social community in your neighborhood.",
            },
            courts_reconciliation: {
                title: "Mediation & Arbitration Courts",
                description: "Volunteers offering full assistance in arbitration / reconciliation for any dispute.",
            },
            national_gemach: {
                title: "National Free-Loan Fund",
                description: "All free-loan funds under one roof.",
            },
            neighborhood_committees: {
                title: "Neighborhood Committees",
                description: "The people's governance revolution over institutions - learn and join.",
            },
            state_auditor: {
                title: "State Authorities Auditor",
                description: "Auditing the authorities, securing residents' rights.",
            },
            public_rating: {
                title: "Public Rating",
                description: "The people rate the authorities and public servants.",
            },
            experts: {
                title: "The Experts",
                description: "Working together to solve nationwide problems.",
            },
            referendum: {
                title: "People's Referendums",
                description: "Share your opinion on the issues of the day.",
            },
            purchasing_group: {
                title: "Purchasing Group",
                description: "Join our purchasing group and cut your expenses immediately!",
            },
            group_investments: {
                title: "Group Investments",
                description: "Connect with our social investors group.",
            },
            professionals: {
                title: "Our Professionals",
                description: "Qualified professionals who signed our community terms and offer benefits.",
            },
            freedom_store: {
                title: "Freedom Store",
                description: "Curated products for natural health, home agriculture, technology, and more.",
            },
        },
        banner: {
            go_to_site: "Visit the site →",
        },
        news_block: {
            tagline: "Our media is independent - we cover the country's events from the resident's perspective!",
            image_alt: "News",
        },
        socials: {
            title: "Follow us on social media",
        },
    },

    // ----- Sidebar -----
    sidebar: {
        aria_label: "Ads and partners",
        heading: "Advancing toward a just and independent society",
        opens_new_window: " (opens in a new window)",
    },

    // ----- Right ad banner -----
    right_ads: {
        aria_label: "Advertisements",
        heading: "Sponsored content",
        slot_text: "Ad space",
        slot_desc: "could be yours",
        cta_details: "Learn more",
        this_word: "",
    },

    // ----- Mobile drawer -----
    drawer: {
        close_ads_aria: "Close ads",
        dialog_aria: "Personal area and national community benefits",
        personal_area: "Personal Area",
        close: "Close",
        personal_messages: "📩 Personal messages",
        to_personal_area: "To my personal area →",
        my_personal_area: "To my personal area →",
        your_personal_area: "To your personal area →",
        login_register: "Sign in / Register",
        wallet_alt: "Wallet",
        benefits_title: "National benefits from",
        ad_slot_title: "Ad space",
        ad_slot_sub: "Click to advertise here",
        open_tab_aria: "Open community benefits",
        tab_text: "Personal area & benefits",
    },

    // ----- Ads data -----
    ads: {
        social_store: {
            title: "The Social Store",
            description: "Curated products for natural health, home agriculture, technology, and more",
            cta: "Step in for a better life",
            hover: "Our store!",
        },
        peace_houses: {
            title: "Houses of Reconciliation",
            description: "Volunteers offering full assistance in arbitration / reconciliation for any dispute",
            cta: "Have a dispute? Click for a solution",
        },
        national_gemach: {
            title: "National Free-Loan Fund",
            description: "All free-loan funds under one roof",
            cta: "Visit the National Free-Loan Fund",
            hover: "Find any free-loan fund easily!",
        },
        neighborhood_committees: {
            title: "Neighborhood Committees",
            description: "The people's governance revolution over institutions",
            cta: "Learn and join the people's governance revolution",
        },
        state_auditor: {
            title: "State Authorities Auditor",
            description: "Auditing the authorities, securing residents' rights",
            cta: "Auditing the authorities, securing residents' rights",
        },
        public_rating: {
            title: "Public Rating",
            description: "The people rate the authorities and public servants",
            cta: "The people rate the authorities and public servants",
        },
        referendum: {
            title: "People's Referendums",
            description: "Share your opinion on the issues of the day",
            cta: "Share your opinion on the issues of the day",
            hover: "Share your opinion on the issues of the day",
        },
        purchasing_group: {
            title: "Purchasing Group",
            description: "Cut your expenses",
            cta: "Join our purchasing group and cut your expenses immediately!",
        },
        investors_club: {
            title: "Social Investors Club",
            description: "Connect with our investors group",
            cta: "Connect with our investors group",
        },
        professionals: {
            title: "Qualified Professionals",
            description: "Signed our community terms and offer us unique discounts and benefits",
            cta: "Looking for a quality professional in your area?",
        },
    },
}));

register('ru', () => Promise.resolve({
    // ----- Header / general -----
    welcome: "Путь к свободе",
    app_description: "Доказываем, что новый мир возможен",
    about: "О проекте",
    contact_us: "Связаться с нами",
    connected: "На связи",
    back_home: "На главную",
    all_rights_reserved: "Все права защищены",
    choose_language: "Выбрать язык",

    // ----- Layout -----
    layout: {
        skip_to_main: "Перейти к основному содержимому",
    },

    // ----- Footer -----
    footer: {
        brand: "Путь к свободе",
        brand_aria: "Путь к свободе (открывается в новом окне)",
        bottom_nav_aria: "Нижняя навигация",
        terms_part1: "Условия использования",
        terms_part2: "Заявление о доступности и др.",
        contact_email_aria: "Связаться с нами - отправить письмо",
        leaders_part1: "Требуются лидеры",
        leaders_part2: "и волонтёры",
    },

    // ----- Page (home) -----
    page: {
        hero_title: "Путь к свободе",
        intro: {
            movement_label: "Путь к свободе -",
            movement_text: "это общественное движение, цель которого - развивать и улучшать израильское общество, делая его более ответственным, солидарным и свободным. Движение работает над тем, чтобы освободить жителей от концентрации власти, сосредоточенной сегодня в руках узкого круга людей, контролирующих банки, СМИ, экономику, политику и государственные органы.",
            vision_label: "Видение -",
            vision_text: "Объединение жителей, децентрализация концентрированной власти государственных институтов, надзор, контроль и участие народа в принятии решений.",
            activity_label: "Деятельность -",
            activity_text: "Движение «Путь к свободе» разработало приложения, продвигающие народное управление, создало сеть общественных координаторов в районах по всей стране и сформировало большое сообщество, продвигающее ценности свободы, братства и власти народа над его институтами!",
        },
        video: {
            title: "Путь к свободе",
            play_aria: "Воспроизвести видео «Путь к свободе»",
        },
        members: {
            prefix: "В движении «Путь к свободе» уже",
            suffix: "участников - и нас становится больше!",
        },
        platforms_title: "Модель народного управления работает и развивается благодаря сети инновационных инструментов и платформ:",
        columns: {
            community: "Сообщество",
            governance: "Управление",
            economy: "Экономика",
        },
        sites: {
            community_neighborhood: {
                title: "Сообщество в вашем районе",
                description: "Социальное сообщество «Путь к свободе» в вашем районе.",
            },
            courts_reconciliation: {
                title: "Суды примирения и арбитража",
                description: "Волонтёры помогут с разрешением и примирением в любом споре.",
            },
            national_gemach: {
                title: "Национальный фонд беспроцентной помощи",
                description: "Все фонды взаимопомощи под одной крышей.",
            },
            neighborhood_committees: {
                title: "Районные комитеты",
                description: "Революция народного управления над институтами - узнайте и присоединяйтесь.",
            },
            state_auditor: {
                title: "Аудитор государственных органов",
                description: "Контролируем органы власти и отстаиваем права жителей.",
            },
            public_rating: {
                title: "Народный рейтинг",
                description: "Народ оценивает органы власти и государственных служащих.",
            },
            experts: {
                title: "Эксперты",
                description: "Вместе работаем над решением общенациональных проблем.",
            },
            referendum: {
                title: "Народные референдумы",
                description: "Выскажите своё мнение по актуальным вопросам.",
            },
            purchasing_group: {
                title: "Закупочная группа",
                description: "Присоединяйтесь к нашей закупочной группе и сразу снизьте свои расходы!",
            },
            group_investments: {
                title: "Групповые инвестиции",
                description: "Присоединяйтесь к нашему сообществу социальных инвесторов.",
            },
            professionals: {
                title: "Наши специалисты",
                description: "Квалифицированные специалисты, подписавшие условия сообщества и предоставляющие льготы.",
            },
            freedom_store: {
                title: "Магазин «Свобода»",
                description: "Подборка товаров для натурального здоровья, домашнего садоводства, технологий и не только.",
            },
        },
        banner: {
            go_to_site: "Перейти на сайт →",
        },
        news_block: {
            tagline: "Наши СМИ независимы - освещаем события страны с точки зрения прав жителя!",
            image_alt: "Новости",
        },
        socials: {
            title: "Подписывайтесь на нас в соцсетях",
        },
    },

    // ----- Sidebar -----
    sidebar: {
        aria_label: "Реклама и партнёры",
        heading: "Идём к справедливому и независимому обществу",
        opens_new_window: " (открывается в новом окне)",
    },

    // ----- Right ad banner -----
    right_ads: {
        aria_label: "Реклама",
        heading: "Рекламный контент",
        slot_text: "Рекламное место",
        slot_desc: "может стать вашим",
        cta_details: "Подробнее",
        this_word: "",
    },

    // ----- Mobile drawer -----
    drawer: {
        close_ads_aria: "Закрыть рекламу",
        dialog_aria: "Личный кабинет и льготы национального сообщества",
        personal_area: "Личный кабинет",
        close: "Закрыть",
        personal_messages: "📩 Личные сообщения",
        to_personal_area: "В личный кабинет →",
        my_personal_area: "В мой личный кабинет →",
        your_personal_area: "В ваш личный кабинет →",
        login_register: "Вход / Регистрация",
        wallet_alt: "Кошелёк",
        benefits_title: "Национальные льготы",
        ad_slot_title: "Рекламное место",
        ad_slot_sub: "Нажмите, чтобы разместить рекламу",
        open_tab_aria: "Открыть льготы сообщества",
        tab_text: "Личный кабинет и льготы",
    },

    // ----- Ads data -----
    ads: {
        social_store: {
            title: "Социальный магазин",
            description: "Подборка товаров для натурального здоровья, домашнего садоводства, технологий и не только",
            cta: "Загляните в магазин для лучшей жизни",
            hover: "Наш магазин!",
        },
        peace_houses: {
            title: "Дома примирения",
            description: "Волонтёры помогут с разрешением и примирением в любом споре",
            cta: "Есть спор? Нажмите за решением",
        },
        national_gemach: {
            title: "Национальный фонд беспроцентной помощи",
            description: "Все фонды взаимопомощи под одной крышей",
            cta: "На сайт национального фонда",
            hover: "Найдите любой фонд легко!",
        },
        neighborhood_committees: {
            title: "Районные комитеты",
            description: "Революция народного управления над институтами",
            cta: "Узнайте и присоединяйтесь к революции народного управления",
        },
        state_auditor: {
            title: "Аудитор государственных органов",
            description: "Контролируем органы власти, отстаиваем права жителей",
            cta: "Контролируем органы власти, отстаиваем права жителей",
        },
        public_rating: {
            title: "Народный рейтинг",
            description: "Народ оценивает органы власти и государственных служащих",
            cta: "Народ оценивает органы власти и государственных служащих",
        },
        referendum: {
            title: "Народные референдумы",
            description: "Выскажите своё мнение по актуальным вопросам",
            cta: "Выскажите своё мнение по актуальным вопросам",
            hover: "Выскажите своё мнение по актуальным вопросам",
        },
        purchasing_group: {
            title: "Закупочная группа",
            description: "Снизьте свои расходы",
            cta: "Присоединяйтесь к нашей закупочной группе и сразу снизьте расходы!",
        },
        investors_club: {
            title: "Клуб социальных инвесторов",
            description: "Присоединяйтесь к нашей инвесторской группе",
            cta: "Присоединяйтесь к нашей инвесторской группе",
        },
        professionals: {
            title: "Квалифицированные специалисты",
            description: "Подписали условия сообщества и предоставляют нам уникальные скидки и льготы",
            cta: "Ищете качественного специалиста в вашем районе?",
        },
    },
}));

init({
    fallbackLocale: 'he',
    initialLocale: (typeof window !== 'undefined' && localStorage.getItem('lang')) || getLocaleFromNavigator() || 'he',
});
