import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TestimonialSection from '../../../apps/web/components/app/TestimonialSection.vue';

const content = readFileSync('apps/web/content/_testimonials/alex-rivera.md', 'utf8');
const field = (name: string) => content.match(new RegExp(`^${name}: '(.+)'$`, 'm'))![1]!;
const testimonial = { quote: field('quote'), author: field('author'), position: field('title'), avatar: field('avatar') };
const global = {
  stubs: {
    LayoutPageSection: { template: '<div><slot /></div>' },
    NuxtImg: { props: ['src', 'alt'], template: '<img :src="src" :alt="alt" @error="$emit(\'error\', $event)">' },
  },
};

describe('TestimonialSection', () => {
  it('renders the local quote and attribution and removes a failed avatar', async () => {
    const wrapper = mount(TestimonialSection, { props: { testimonial }, global });
    expect(wrapper.get('blockquote').text()).toBe(testimonial.quote);
    expect(wrapper.get('figcaption').text()).toContain(testimonial.author);
    expect(wrapper.get('figcaption').text()).toContain(testimonial.position);
    expect(wrapper.get('img').attributes('src')).toBe(testimonial.avatar);
    expect(wrapper.get('img').attributes('alt')).toBe('');
    await wrapper.get('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.get('figcaption').text()).toContain(testimonial.author);
  });

  it('renders without an avatar and escapes quote content', () => {
    const wrapper = mount(TestimonialSection, {
      props: { testimonial: { ...testimonial, avatar: undefined, quote: '<script>alert(1)</script>' } }, global,
    });
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('script').exists()).toBe(false);
    expect(wrapper.get('blockquote').text()).toBe('<script>alert(1)</script>');
  });
});
