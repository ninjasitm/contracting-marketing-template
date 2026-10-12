import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, expect, it } from 'vitest';
import * as accordion from '../../../apps/web/components/ui/accordion';
import * as dialog from '../../../apps/web/components/ui/dialog';
import * as select from '../../../apps/web/components/ui/select';
import * as checkbox from '../../../apps/web/components/ui/checkbox';
import * as radio from '../../../apps/web/components/ui/radio-group';
import * as badge from '../../../apps/web/components/ui/badge';
import * as popover from '../../../apps/web/components/ui/popover';
import * as navigation from '../../../apps/web/components/ui/navigation-menu';
import * as carousel from '../../../apps/web/components/ui/carousel';

describe('marketing UI foundation', () => {
  it('loads every public family against the installed Reka version', () => {
    for (const family of [accordion, dialog, select, checkbox, radio, badge, popover, navigation, carousel]) {
      expect(Object.keys(family).length).toBeGreaterThan(0);
      expect(Object.values(family).every(Boolean)).toBe(true);
    }
  });
  it('forwards accordion state and disabled controls', async () => {
    const wrapper = mount(defineComponent({
      components: { ...accordion },
      template: `<Accordion type="single" collapsible><AccordionItem value="first"><AccordionTrigger>Details</AccordionTrigger><AccordionContent>Detail content</AccordionContent></AccordionItem><AccordionItem value="second" disabled><AccordionTrigger>Unavailable</AccordionTrigger><AccordionContent>Hidden</AccordionContent></AccordionItem></Accordion>`,
    }));
    const controls = wrapper.findAll('button');
    const first = controls[0]!;
    expect(first.attributes('aria-expanded')).toBe('false');
    await first.trigger('click');
    expect(first.attributes('aria-expanded')).toBe('true');
    expect(wrapper.text()).toContain('Detail content');
    expect(controls[1]!.attributes('disabled')).toBeDefined();
    wrapper.unmount();
  });
  it('keeps checkbox labels, disabled state and update events', async () => {
    const wrapper = mount(checkbox.Checkbox, { props: { modelValue: false }, attrs: { 'aria-label': 'Subscribe' } });
    expect(wrapper.attributes('role')).toBe('checkbox');
    expect(wrapper.attributes('aria-label')).toBe('Subscribe');
    await wrapper.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
    await wrapper.setProps({ disabled: true });
    expect(wrapper.get('[role="checkbox"]').attributes('disabled')).toBeDefined();
    await wrapper.get('[role="checkbox"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    wrapper.unmount();
  });
  it('does not steal arrow keys from controls inside a carousel', () => {
    const wrapper = mount(carousel.Carousel, { slots: { default: '<input aria-label="Search slides">' } });
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    wrapper.get('input').element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    const navigationEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    wrapper.element.dispatchEvent(navigationEvent);
    expect(navigationEvent.defaultPrevented).toBe(true);
    wrapper.unmount();
  });
  it('mounts the remaining families with accessible triggers and disabled choices', async () => {
    const wrapper = mount(defineComponent({
      components: { ...dialog, ...select, ...radio, ...badge, ...popover, ...navigation },
      template: `<div>
        <Badge>Status</Badge>
        <Dialog><DialogTrigger disabled>Open dialog</DialogTrigger></Dialog>
        <Popover><PopoverTrigger>Open popover</PopoverTrigger></Popover>
        <Select><SelectTrigger disabled aria-label="Choose"><SelectValue placeholder="Choose" /></SelectTrigger></Select>
        <RadioGroup aria-label="Plan"><RadioGroupItem value="basic" aria-label="Basic" /><RadioGroupItem value="premium" disabled aria-label="Premium" /></RadioGroup>
        <NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuLink href="/work">Work</NavigationMenuLink></NavigationMenuItem></NavigationMenuList></NavigationMenu>
      </div>`,
    }));
    expect(wrapper.text()).toContain('Status');
    expect(wrapper.get('button[aria-haspopup="dialog"]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[role="combobox"]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('Plan');
    expect(wrapper.get('[role="radio"][disabled]').attributes('aria-label')).toBe('Premium');
    await wrapper.get('[role="radio"]:not([disabled])').trigger('click');
    expect(wrapper.get('[role="radio"]:not([disabled])').attributes('aria-checked')).toBe('true');
    expect(wrapper.get('a').attributes('href')).toBe('/work');
    wrapper.unmount();
  });
});
