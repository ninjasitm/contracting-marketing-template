import type { NuxtAwesomeAppConfig } from './app.config';

export default defineNuxtSchema({
  appConfig: {
    config: {
      title: '',
      description: '',
      companyName: '',
      email: '',
      logo: '',
      phone: '',
      url: '',
      address: '',
      naicsCodesTitle: '',
      naicsCodes: [],
      companyInfo: [],
      socialLinks: [],
      layout: {
        page: {
          navbar: {
            menus: [],
            links: {},
          },
        },
        footer: {
          year: new Date().getFullYear(),
          naicsCodesTitle: '',
          containerStyle: {},
          companyInfoStyle: {},
          footerStyle: {},
        },
        welcome: {
          title: '',
          disableInfoReplaceIndexInWelcomePage: true,
        },
      },
      author: {
        name: 'nitm',
        links: {},
      },
    } as NuxtAwesomeAppConfig,
  },
});
