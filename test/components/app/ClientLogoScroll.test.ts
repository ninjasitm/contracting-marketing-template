import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientLogoScroll from '../../../apps/web/components/app/ClientLogoScroll.vue';
import clients from '../../../apps/web/content/clients.json';

describe('ClientLogoScroll', () => {
  it('keeps the logos paused until the resume button is clicked', async () => {
    const wrapper = mount(ClientLogoScroll);
    const button = wrapper.get('button');
    const scroll = wrapper.get('.client-logo-scroll');

    expect(button.attributes('type')).toBe('button');
    expect(scroll.classes()).not.toContain('is-paused');
    await button.trigger('click');
    await button.trigger('blur');
    await scroll.trigger('mouseleave');
    expect(scroll.classes()).toContain('is-paused');
    expect(button.text()).toBe('Resume client logos');
    await button.trigger('click');
    expect(scroll.classes()).not.toContain('is-paused');
    expect(button.text()).toBe('Pause client logos');
  });

  it('renders the local clients with an inaccessible duplicate and stopped reduced motion', () => {
    const wrapper = mount(ClientLogoScroll);
    const groups = wrapper.findAll('ul');

    expect(groups).toHaveLength(2);
    const [original, duplicate] = groups;
    if (!original || !duplicate) throw new Error('Both logo groups must render');
    expect(original.attributes('aria-hidden')).toBeUndefined();
    expect(duplicate.attributes('aria-hidden')).toBe('true');
    expect(duplicate.attributes('inert')).toBeDefined();
    expect(duplicate.findAll('a')).toHaveLength(0);
    expect(wrapper.findAll('a')).toHaveLength(clients.length);
    for (const group of groups) {
      expect(group.findAll('img').map(image => image.attributes('alt')))
        .toEqual(clients.map(client => client.name));
      expect(group.findAll('img').map(image => image.attributes('src')))
        .toEqual(clients.map(client => client.logo));
      expect(group.classes()).toContain('motion-reduce:animate-none');
    }
    expect(duplicate.classes()).toContain('motion-reduce:hidden');
  });
});
