import type { NuxtAwesomeAppConfig } from './app.config';

export default defineNuxtSchema({
  appConfig: {
    config: {
      name: '',
      description: '',
      project: {
        links: {},
      },
      layout: {
        page: {
          navbar: {
            menus: [],
          },
        },
        footer: {
          year: new Date().getFullYear(),
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
