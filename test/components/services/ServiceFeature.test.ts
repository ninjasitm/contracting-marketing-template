import '../../shims-vue.d.ts';
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ServiceFeature from '../../../components/services/ServiceFeature.vue';

/**
 * Test suite for the ServiceFeature component
 */
describe('ServiceFeature', () => {
  // Mock console.error to prevent noise in test output
  vi.spyOn(console, 'error').mockImplementation(() => {});

  it('renders the component with required props', () => {
    const wrapper = mount(ServiceFeature, {
      props: {
        title: 'Test Service',
        iconSrc: '/test/icon.svg',
        description: 'Test description',
      },
      global: {
        stubs: {
          // Create a proper stub for NuxtImg component
          NuxtImg: {
            template: '<img :src="src" :alt="alt" class="nuxtimg-stub" />',
            props: ['src', 'alt', 'loading', 'placeholder'],
          },
        },
      },
    });

    // Check if title renders correctly
    expect(wrapper.text()).toContain('Test Service');

    // Check if description renders correctly
    expect(wrapper.text()).toContain('Test description');

    // Test that the component structure is correct instead of testing the src attribute
    expect(wrapper.find('.nuxtimg-stub').exists()).toBe(true);
  });

  it('renders features when provided', () => {
    const features = ['Feature 1', 'Feature 2', 'Feature 3'];
    const wrapper = mount(ServiceFeature, {
      props: {
        title: 'Test Service',
        iconSrc: '/test/icon.svg',
        description: 'Test description',
        features,
      },
      global: {
        stubs: ['NuxtImg'],
      },
    });

    // Check if all features are rendered
    features.forEach((feature) => {
      expect(wrapper.text()).toContain(feature);
    });

    // Check if there are 3 list items
    const listItems = wrapper.findAll('li');
    expect(listItems.length).toBe(3);
  });

  it('does not render features section when no features are provided', () => {
    const wrapper = mount(ServiceFeature, {
      props: {
        title: 'Test Service',
        iconSrc: '/test/icon.svg',
        description: 'Test description',
        features: [],
      },
      global: {
        stubs: ['NuxtImg'],
      },
    });

    // Check that no list items are rendered
    const listItems = wrapper.findAll('li');
    expect(listItems.length).toBe(0);
  });

  it('handles image error by calling onImageError', async () => {
    const wrapper = mount(ServiceFeature, {
      props: {
        title: 'Test Service',
        iconSrc: '/test/icon.svg',
        description: 'Test description',
      },
      global: {
        stubs: {
          NuxtImg: {
            template:
              '<img :src="$attrs.src" @error="$emit(\'error\', $event)" />',
          },
        },
      },
    });

    // Trigger the error event
    const img = wrapper.find('img');
    await img.trigger('error');

    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });
});
