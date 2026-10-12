import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LogoLoader from '@/components/app/LogoLoader.vue';
describe('LogoLoader', () => {
  it('uses the supplied brand/status and hides when finished', async () => {
    const wrapper = mount(LogoLoader, { props: { logoSrc: '/brand.svg', message: 'Preparing', size: 'sm' } });
    expect(wrapper.get('[role="status"]').text()).toBe('Preparing');
    expect(wrapper.get('img').attributes('src')).toBe('/brand.svg');
    expect(wrapper.get('img').attributes('alt')).toBe('');
    await wrapper.setProps({ loading: false });
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
