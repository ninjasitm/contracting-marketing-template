import type { AppConfigInput } from 'nuxt/schema';

export default defineAppConfig({
  awesome: {
    name: 'Ninjas in the Machine',
    description:
      'a starter template for Nuxt 3 with minimalist themes design, built in components, drawer & menus, and more.',
    project: {
      links: {
        github: 'https://github.com/viandwi24/nuxt3-awesome-starter',
      },
    },
    layout: {
      page: {
        navbar: {
          menus: [
            { type: 'link', title: 'Work', to: { name: 'work' } },
            { type: 'link', title: 'About', to: { name: 'about' } },
            { type: 'link', title: 'Process', to: { name: 'process' } },
            // dynamic title
            // {
            //   type: 'button',
            //   title: (nuxt) =>
            //     (nuxt._appConfig as AppConfigInput)?.awesome?.name || '',
            //   to: (nuxt) => (nuxt._appConfig as AppConfigInput)?.awesome?.name || '',
            // },
          ],
          links: {
            startProject: '/start-project',
            capabilities: '/assets/capabilities.pdf',
          },
        },
      },
      footer: {
        year: new Date().getFullYear(),
      },
      welcome: {
        title: 'Contracting Starter',
        disableInfoReplaceIndexInWelcomePage: true,
      },
    },
    author: {
      name: 'ninjasitm',
      links: {
        github: 'https://gitlab.com/ninjasitm',
        medium: 'https://nitm.medium.com',
        website: 'https://ninjasitm.com',
        capabilities: '/assets/capabilities.pdf',
      },
    },
  },
});
