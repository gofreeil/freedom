import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('he', () => Promise.resolve({
    welcome: "יוצאים לחירות",
    app_description: "לכלל פעילות התנועה החברתית",
    about: "אודות",
    contact_us: "צור קשר",
    connected: "מחוברים",
    back_home: "חזרה לדף הבית",
    all_rights_reserved: "כל הזכויות שמורות",
}));

register('en', () => Promise.resolve({
    welcome: "Going to Freedom",
    app_description: "For all the social movement's activity",
    about: "About",
    contact_us: "Contact Us",
    connected: "Online",
    back_home: "Back to Home",
    all_rights_reserved: "All rights reserved",
}));

register('ru', () => Promise.resolve({
    welcome: "Путь к свободе",
    app_description: "Вся деятельность общественного движения",
    about: "О проекте",
    contact_us: "Связаться с нами",
    connected: "На связи",
    back_home: "На главную",
    all_rights_reserved: "Все права защищены",
}));

init({
    fallbackLocale: 'he',
    initialLocale: (typeof window !== 'undefined' && localStorage.getItem('lang')) || getLocaleFromNavigator() || 'he',
});
