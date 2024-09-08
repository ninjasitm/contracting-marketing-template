import type { NuxtAwesomeAppConfig } from '../app.config';
import appConfig from '../content/config.json';

export default defineAppConfig({
  appConfig: {
    name: appConfig.title,
    logo: appConfig.logo,
    description: appConfig.description,
    layout: {
      page: {
        navbar: {
          menus: [
            { type: 'link', title: 'Work', to: { name: 'work' } },
            { type: 'link', title: 'About', to: { name: 'about' } },
            { type: 'link', title: 'Process', to: { name: 'process' } },
          ],
          // links: appConfig.navbar.links || {},
          links: {},
        },
      },
      footer: {
        ...appConfig.footer,
        naicsCodes: appConfig.naicsCodes,
        year: new Date().getFullYear(),
      },
      welcome: {
        title: appConfig.title,
        disableInfoReplaceIndexInWelcomePage: true,
      },
    },
    author: {
      name: appConfig.companyName,
    },
  } as NuxtAwesomeAppConfig,
});
