---
applyTo: '**/*.{test,spec}.{ts,tsx}'
description: 'Vitest testing conventions and patterns'
---

# Testing Instructions

## Test Framework

**Test Framework:** Vitest 1.6
**Test Utils:** @vue/test-utils 2.4, @nuxt/test-utils 3.19
**Coverage:** @vitest/coverage-v8 1.6
**Environment:** jsdom 26

## Configuration

**Config File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## Test Structure

### File Organization

```
test/
  components/              # Component tests
    Button.test.ts
    Card.test.ts
    about/
      TeamMember.test.ts
  composables/             # Composable tests
    useContent.test.ts
  utils/                   # Utility tests
    utils.test.ts
  tailwind/                # Tailwind utility tests
  shims-vue.d.ts           # Vue type definitions
```

### Naming Conventions

- **Test files:** `*.test.ts` or `*.spec.ts`
- **Test suites:** `describe('ComponentName', () => {})`
- **Test cases:** `it('should do something', () => {})`
- **Setup/teardown:** `beforeEach()`, `afterEach()`, `beforeAll()`, `afterAll()`

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# Coverage report
pnpm test:coverage

# Run specific file
vitest run test/components/Button.test.ts

# Run tests matching pattern
vitest run --grep "Button"

# UI mode (visual test runner)
vitest --ui
```

## Component Testing

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '@/components/ui/button/Button.vue';

describe('Button', () => {
  it('renders properly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'default',
      },
      slots: {
        default: 'Click me',
      },
    });

    expect(wrapper.text()).toContain('Click me');
    expect(wrapper.classes()).toContain('btn');
  });

  it('emits click event', async () => {
    const wrapper = mount(Button);

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});
```

### Testing Props

```typescript
describe('TeamMember', () => {
  it('displays member information', () => {
    const member = {
      name: 'John Doe',
      role: 'Developer',
      bio: 'Lorem ipsum',
    };

    const wrapper = mount(TeamMember, {
      props: { member },
    });

    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('Developer');
    expect(wrapper.text()).toContain('Lorem ipsum');
  });

  it('validates required props', () => {
    // Test with missing props
    expect(() => {
      mount(TeamMember, {
        props: {},
      });
    }).toThrow();
  });
});
```

### Testing Events

```typescript
describe('ContactForm', () => {
  it('emits submit event with form data', async () => {
    const wrapper = mount(ContactForm);

    // Fill form
    await wrapper.find('input[name="name"]').setValue('John');
    await wrapper.find('input[name="email"]').setValue('john@example.com');
    await wrapper.find('textarea[name="message"]').setValue('Hello');

    // Submit form
    await wrapper.find('form').trigger('submit');

    // Check emitted event
    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        name: 'John',
        email: 'john@example.com',
        message: 'Hello',
      },
    ]);
  });
});
```

### Testing Slots

```typescript
describe('Card', () => {
  it('renders default slot content', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<p>Card content</p>',
      },
    });

    expect(wrapper.html()).toContain('<p>Card content</p>');
  });

  it('renders named slots', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<h2>Header</h2>',
        default: '<p>Body</p>',
        footer: '<button>Action</button>',
      },
    });

    expect(wrapper.html()).toContain('<h2>Header</h2>');
    expect(wrapper.html()).toContain('<p>Body</p>');
    expect(wrapper.html()).toContain('<button>Action</button>');
  });

  it('renders scoped slot with data', () => {
    const wrapper = mount(DataList, {
      slots: {
        default: `
          <template #default="{ item }">
            <div>{{ item.name }}</div>
          </template>
        `,
      },
    });

    expect(wrapper.text()).toContain('Expected item name');
  });
});
```

### Testing Computed Properties

```typescript
describe('UserProfile', () => {
  it('computes full name from first and last name', () => {
    const wrapper = mount(UserProfile, {
      props: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    expect(wrapper.text()).toContain('John Doe');
  });

  it('updates computed value when props change', async () => {
    const wrapper = mount(UserProfile, {
      props: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    expect(wrapper.text()).toContain('John Doe');

    await wrapper.setProps({ firstName: 'Jane' });

    expect(wrapper.text()).toContain('Jane Doe');
  });
});
```

### Testing Async Operations

```typescript
describe('DataLoader', () => {
  it('displays loading state', async () => {
    const wrapper = mount(DataLoader);

    expect(wrapper.text()).toContain('Loading...');
  });

  it('displays data after loading', async () => {
    const mockData = { items: ['a', 'b', 'c'] };

    vi.mock('@/composables/useData', () => ({
      useData: vi.fn(() => ({
        data: ref(mockData),
        pending: ref(false),
        error: ref(null),
      })),
    }));

    const wrapper = mount(DataLoader);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('a');
    expect(wrapper.text()).toContain('b');
    expect(wrapper.text()).toContain('c');
  });

  it('displays error message on failure', async () => {
    vi.mock('@/composables/useData', () => ({
      useData: vi.fn(() => ({
        data: ref(null),
        pending: ref(false),
        error: ref(new Error('Failed to load')),
      })),
    }));

    const wrapper = mount(DataLoader);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Failed to load');
  });
});
```

## Composable Testing

### Testing Composables

```typescript
import { describe, it, expect } from 'vitest';
import { useCounter } from '@/composables/useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { count } = useCounter();
    expect(count.value).toBe(0);
  });

  it('initializes with custom value', () => {
    const { count } = useCounter(10);
    expect(count.value).toBe(10);
  });

  it('increments count', () => {
    const { count, increment } = useCounter();

    increment();
    expect(count.value).toBe(1);

    increment();
    expect(count.value).toBe(2);
  });

  it('computes doubled value', () => {
    const { count, doubled, increment } = useCounter();

    expect(doubled.value).toBe(0);

    increment();
    expect(doubled.value).toBe(2);

    increment();
    expect(doubled.value).toBe(4);
  });
});
```

### Testing Composables with Dependencies

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFetch } from '@/composables/useFetch';

// Mock external dependencies
vi.mock('@/utils/api', () => ({
  fetchData: vi.fn(),
}));

describe('useFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    const { fetchData } = await import('@/utils/api');
    vi.mocked(fetchData).mockResolvedValue(mockData);

    const { data, loading, error, fetch } = useFetch('/api/test');

    expect(loading.value).toBe(false);

    await fetch();

    expect(data.value).toEqual(mockData);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('handles errors', async () => {
    const mockError = new Error('Fetch failed');
    const { fetchData } = await import('@/utils/api');
    vi.mocked(fetchData).mockRejectedValue(mockError);

    const { data, error, fetch } = useFetch('/api/test');

    await fetch();

    expect(data.value).toBeNull();
    expect(error.value).toBe(mockError);
  });
});
```

## Utility Testing

### Testing Pure Functions

```typescript
import { describe, it, expect } from 'vitest';
import { cn, formatDate, slugify } from '@/utils/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('base', 'additional')).toBe('base additional');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'active', false && 'disabled')).toBe(
        'base active',
      );
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2026-02-09');
      expect(formatDate(date)).toBe('Feb 9, 2026');
    });
  });

  describe('slugify', () => {
    it('converts string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello   World!')).toBe('hello-world');
    });
  });
});
```

## Mocking

### Mocking Modules

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('@/utils/api', () => ({
  fetchData: vi.fn(),
  postData: vi.fn(),
}));

// Mock specific functions
vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: ref({ id: 1, name: 'Test User' }),
    isAuthenticated: ref(true),
  })),
}));
```

### Mocking Nuxt Composables

```typescript
import { vi } from 'vitest';

// Mock useFetch
vi.mock('#app', () => ({
  useFetch: vi.fn(() => ({
    data: ref({ message: 'Mocked data' }),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),
  useAsyncData: vi.fn(() => ({
    data: ref({ items: [] }),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),
  navigateTo: vi.fn(),
}));
```

### Mocking API Calls

```typescript
import { vi, beforeEach } from 'vitest';

describe('DataFetcher', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('fetches data from API', async () => {
    const mockResponse = { data: 'test' };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchData('/api/test');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/api/test');
  });
});
```

## Snapshot Testing

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '@/components/ui/button/Button.vue';

describe('Button snapshots', () => {
  it('matches snapshot for default variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'default' },
      slots: { default: 'Click me' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('matches snapshot for primary variant', () => {
    const wrapper = mount(Button, {
      props: { variant: 'primary' },
      slots: { default: 'Submit' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
```

## Coverage

### Running Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open coverage/index.html
```

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'components/**/*.vue',
        'composables/**/*.ts',
        'utils/**/*.ts',
        'stores/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },
});
```

## Best Practices

### ✅ Do

- Write descriptive test names: `it('should display error message when form is invalid')`
- Follow AAA pattern: Arrange, Act, Assert
- Test one thing per test case
- Use `beforeEach()` for common setup
- Clean up after tests (timers, event listeners, etc.)
- Mock external dependencies
- Test edge cases and error conditions
- Use data-testid for reliable selectors
- Keep tests independent and isolated
- Test behavior, not implementation details

### ❌ Don't

- Write tests that depend on execution order
- Test implementation details (internal state)
- Use timeouts to wait for async operations (use `await`)
- Share state between tests
- Test third-party libraries
- Skip tests without good reason
- Write overly complex tests
- Ignore test failures
- Forget to clean up mocks (`vi.clearAllMocks()`)

## Test Patterns

### AAA Pattern

```typescript
it('increments counter', async () => {
  // Arrange
  const wrapper = mount(Counter, {
    props: { initialValue: 5 },
  });

  // Act
  await wrapper.find('button.increment').trigger('click');

  // Assert
  expect(wrapper.text()).toContain('6');
});
```

### Testing User Interactions

```typescript
it('handles form submission', async () => {
  const wrapper = mount(ContactForm);

  // Fill form
  await wrapper.find('#name').setValue('John');
  await wrapper.find('#email').setValue('john@example.com');

  // Submit
  await wrapper.find('form').trigger('submit.prevent');

  // Wait for async validation
  await wrapper.vm.$nextTick();

  // Assert
  expect(wrapper.emitted('submit')).toBeTruthy();
});
```

### Testing Error States

```typescript
it('displays error when API call fails', async () => {
  // Mock failed API call
  vi.mocked(fetchData).mockRejectedValue(new Error('Network error'));

  const wrapper = mount(DataDisplay);

  // Wait for component to handle error
  await wrapper.vm.$nextTick();

  expect(wrapper.find('.error').text()).toContain('Network error');
});
```

## Related Documentation

- [Vitest Docs](https://vitest.dev)
- [Vue Test Utils](https://test-utils.vuejs.org)
- [Nuxt Test Utils](https://nuxt.com/docs/getting-started/testing)
- [AGENTS.md](../../AGENTS.md)

---

**Last Updated:** 2026-02-09
