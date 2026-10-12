import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BlogPostCard from '../../../apps/web/components/posts/BlogPostCard.vue';

const global = { stubs: {
  NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  NuxtImg: { props: ['src'], template: '<img :src="src" @error="$emit(\'error\', $event)">' },
} };

describe('BlogPostCard', () => {
  it('links escaped titles and omits absent metadata and invalid dates', () => {
    const wrapper = mount(BlogPostCard, { props: { post: { title: '<b>Example</b>', slug: 'example', date: 'invalid' } }, global });
    expect(wrapper.get('a').attributes('href')).toBe('/posts/example');
    expect(wrapper.get('h3').text()).toBe('<b>Example</b>');
    expect(wrapper.find('b').exists()).toBe(false);
    expect(wrapper.find('time').exists()).toBe(false);
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('ul').exists()).toBe(false);
  });
  it('renders optional metadata and removes failed images', async () => {
    const wrapper = mount(BlogPostCard, { props: { post: { title: 'Example', slug: 'example', summary: 'Example summary', date: '2026-01-15', heroImage: '/example.jpg', author: 'Example author', tags: ['Example tag'] } }, global });
    expect(wrapper.get('time').text()).toBe('Jan 15, 2026');
    expect(wrapper.text()).toContain('Example summary');
    expect(wrapper.text()).toContain('Example author');
    expect(wrapper.get('li').text()).toBe('Example tag');
    await wrapper.get('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
  });
});
