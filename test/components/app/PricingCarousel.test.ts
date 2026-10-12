import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, it, expect, vi } from 'vitest';
import PricingCarousel from '../../../apps/web/components/app/PricingCarousel.vue';
describe('PricingCarousel', () => {
  it('retains plan content, alignment, safe actions and working dots with unique instructions', async () => {
    const props = { plans: [{ title: 'Starter', price: '$0', unit: 'month', unitAmount: '1', featured: true, features: ['Support'], textAlign: 'right' as const, actionButton: { label: 'Choose', url: '/start' } }, { title: 'Unsafe', price: '$10', actionButton: { label: 'Bad link', url: 'javascript:alert(1)' } }] };
    const global = { stubs: { Carousel: { name: 'CarouselMock', template: '<div role="region"><slot /></div>' }, CarouselContent: { template: '<div><slot /></div>' }, CarouselItem: { template: '<div><slot /></div>' }, CarouselNext: true, CarouselPrevious: true } };
    const wrapper = mount(PricingCarousel, { props, global });
    expect(wrapper.text()).toContain('$0');
    expect(wrapper.text()).toContain('Support');
    expect(wrapper.get('[data-featured=true]').classes()).toContain('text-right');
    expect(wrapper.get('a').attributes('href')).toBe('/start');
    expect(wrapper.text()).not.toContain('Bad link');
    const api = { on: vi.fn(), off: vi.fn(), scrollSnapList: () => [0, 1], selectedScrollSnap: () => 0, scrollTo: vi.fn() };
    wrapper.findComponent({ name: 'CarouselMock' }).vm.$emit('init-api', api);
    await wrapper.vm.$nextTick();
    await wrapper.get('[aria-label="Go to pricing slide 2"]').trigger('click');
    expect(api.scrollTo).toHaveBeenCalledWith(1);
    expect(wrapper.get('[aria-label="Go to pricing slide 1"]').attributes('aria-current')).toBe('true');
    const other = mount(defineComponent({ components: { PricingCarousel }, setup: () => ({ plans: props.plans }), template: '<PricingCarousel :plans="plans" /><PricingCarousel :plans="plans" />' }), { global });
    const regions = other.findAll('[role=region]');
    expect(regions[0]!.attributes('aria-describedby')).not.toBe(regions[1]!.attributes('aria-describedby'));
    wrapper.unmount(); other.unmount();
    expect(api.off).toHaveBeenCalledTimes(2);
  });
});
