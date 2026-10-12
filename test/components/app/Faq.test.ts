import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Faq from '../../../apps/web/components/app/Faq.vue';

describe('Faq', () => {
  it('uses closed native disclosures and plain text, and hides empty sections', () => {
    const wrapper = mount(Faq, { props: { items: [{ question: 'Example question?', answer: '<b>Example answer</b>' }] } });
    expect(wrapper.get('details').attributes('open')).toBeUndefined();
    expect(wrapper.get('summary').text()).toBe('Example question?');
    expect(wrapper.get('p').text()).toBe('<b>Example answer</b>');
    expect(wrapper.find('b').exists()).toBe(false);
    expect(mount(Faq, { props: { items: [] } }).find('section').exists()).toBe(false);
  });
});
