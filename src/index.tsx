import * as React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import store from '@/redux/store/store';
import routes from '@/redux/routes/routes';
import translationEN from '@/locales/en.json';
import translationZH from '@/locales/zh.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { UserService, rdComponentResources } from 'rd-component';

const normalizeLang = (lang: string): string =>
  lang.startsWith('en') ? 'en-US' : 'zh-CN';

const userLanguage = normalizeLang(UserService.getCurrLang());

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': {
      translation: {
        ...translationZH,
        ...rdComponentResources['zh-CN'].translation,
      },
    },
    'en-US': {
      translation: {
        ...translationEN,
        ...rdComponentResources['en-US'].translation,
      },
    },
  },
  lng: userLanguage,
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={routes} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
