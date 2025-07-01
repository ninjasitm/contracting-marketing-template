# Content Query Optimization Plan

## Overview
This document outlines a comprehensive plan to optimize content querying in the Nuxt contracting marketing template project. The plan addresses path mismatches, inconsistent useAsyncData keys, unwrapped queryContent calls, and performance optimizations.

## Current Issues Identified

### 1. Path Mismatches in `.pages.yml`
- **Issue**: Configuration references `content/_about/teammembers` but actual structure is `content/_about/teamMembers`
- **Files Affected**: [`.pages.yml`](.pages.yml:454)
- **Impact**: Content queries may fail or return empty results

### 2. Inconsistent useAsyncData Keys
- **Issue**: Keys lack standardization across pages
- **Current Examples**:
  - [`app/pages/about/index.vue:38`](app/pages/about/index.vue:38): `'_about.members'`
  - [`app/pages/work/index.vue:57`](app/pages/work/index.vue:57): `'_work.projects'`
  - [`app/pages/work/[slug].vue:31`](app/pages/work/[slug].vue:31): `'_work.project'`
- **Impact**: Potential caching conflicts and debugging difficulties

### 3. Unwrapped queryContent Calls
- **Issue**: Direct `queryContent` calls without `useAsyncData` wrapper
- **Locations**:
  - [`app/pages/work/index.vue:83`](app/pages/work/index.vue:83): Categories query
  - [`app/pages/work/index.vue:106`](app/pages/work/index.vue:106): Category filtering query
- **Impact**: No SSR caching, potential hydration mismatches

### 4. Missing Performance Optimizations
- **Issue**: Lack of systematic caching and query optimization
- **Impact**: Slower page loads and unnecessary network requests

## Implementation Plan

### Phase 1: Fix Path Mismatches
**Duration**: 30 minutes
**Priority**: High

#### Tasks:
1. **Update `.pages.yml` paths**
   - Change `content/_about/teammembers` → `content/_about/teamMembers`
   - Verify all path references match actual directory structure
   - Update any other path inconsistencies found

2. **Validate file references**
   - Check all content imports in Vue files
   - Ensure path consistency across the project

### Phase 2: Standardize useAsyncData Keys
**Duration**: 45 minutes
**Priority**: High

#### New Key Convention:
```typescript
`${routeName}-${contentType}-${context}`
```

#### Examples:
- `'about-team-members'`
- `'work-projects-all'`
- `'work-projects-category-web-design'`
- `'work-project-slug-chip'`
- `'work-project-not-found'`

#### Tasks:
1. **Update existing keys**:
   - [`app/pages/about/index.vue`](app/pages/about/index.vue): `'_about.members'` → `'about-team-members'`
   - [`app/pages/work/index.vue`](app/pages/work/index.vue): `'_work.projects'` → `'work-projects-all'`
   - [`app/pages/work/[slug].vue`](app/pages/work/[slug].vue): `'_work.project'` → `'work-project-slug-${slug}'`

2. **Add dynamic key generation**:
   - Implement context-aware keys for filtered content
   - Add category-specific keys for work projects

### Phase 3: Wrap Unwrapped queryContent Calls
**Duration**: 30 minutes
**Priority**: High

#### Tasks:
1. **Fix categories query in work/index.vue**:
   ```typescript
   // Before:
   (await queryContent('/_work').only('categories').find())

   // After:
   const { data: categoriesData } = await useAsyncData(
     'work-categories-all',
     () => queryContent('/_work').only('categories').find()
   )
   ```

2. **Fix category filtering query**:
   ```typescript
   // Before:
   state.projects = (await query.limit(6).find()) as Project[];

   // After:
   const { data } = await useAsyncData(
     `work-projects-category-${state.currentCategory || 'all'}`,
     () => query.limit(6).find()
   )
   state.projects = data.value || [];
   ```

3. **Add error handling**:
   - Implement proper error states
   - Add loading states where missing

### Phase 4: Performance Optimizations
**Duration**: 60 minutes
**Priority**: Medium

#### 4.1 Query Optimization
- **Selective field loading**: Use `.only()` for required fields only
- **Result limiting**: Implement pagination where appropriate
- **Conditional queries**: Optimize based on user context

#### 4.2 Caching Strategy
- **Server-side caching**: Leverage Nuxt's built-in SSR caching
- **Client-side caching**: Implement `useAsyncData` refresh strategies
- **Cache invalidation**: Set appropriate cache keys and TTL

#### 4.3 SSR Optimization
- **Pre-fetch critical content**: Load above-the-fold content server-side
- **Lazy load non-critical**: Defer loading of secondary content
- **Bundle optimization**: Reduce initial payload size

### Phase 5: Create Content Query Composable
**Duration**: 45 minutes
**Priority**: Medium

#### Create `composables/useContent.ts`:
```typescript
export const useContent = {
  // Team members
  useTeamMembers: () => useAsyncData(
    'about-team-members',
    () => queryContent('/_about/teamMembers').find()
  ),

  // Work projects
  useWorkProjects: (options?: { category?: string, limit?: number }) => {
    const key = options?.category
      ? `work-projects-category-${options.category}`
      : 'work-projects-all'

    return useAsyncData(key, () => {
      const query = queryContent('/_work')
        .only(['slug', 'heroImage', 'description', 'client', 'title'])
        .where({ published: { $eq: true } })

      if (options?.category) {
        query.where({ categories: { $contains: options.category } })
      }

      if (options?.limit) {
        query.limit(options.limit)
      }

      return query.find()
    })
  },

  // Single work project
  useWorkProject: (slug: string) => useAsyncData(
    `work-project-slug-${slug}`,
    () => queryContent('/_work').where({ slug }).findOne()
  ),

  // Work categories
  useWorkCategories: () => useAsyncData(
    'work-categories-all',
    () => queryContent('/_work').only('categories').find()
  )
}
```

### Phase 6: File-by-File Updates
**Duration**: 60 minutes
**Priority**: High

#### 6.1 Update `.pages.yml`
- Fix path mismatches
- Ensure configuration matches actual content structure

#### 6.2 Update [`app/pages/about/index.vue`](app/pages/about/index.vue)
- Use new key convention
- Optimize team members query
- Add error handling

#### 6.3 Update [`app/pages/work/index.vue`](app/pages/work/index.vue)
- Wrap all queryContent calls with useAsyncData
- Implement dynamic keys for category filtering
- Optimize performance with selective field loading

#### 6.4 Update [`app/pages/work/[slug].vue`](app/pages/work/[slug].vue)
- Use dynamic keys based on slug
- Optimize complex queries
- Improve error handling for missing projects

## Implementation Checklist

### Phase 1: Path Fixes
- [ ] Fix `.pages.yml` path references
- [ ] Validate all content imports
- [ ] Test content loading

### Phase 2: Key Standardization
- [ ] Update about page keys
- [ ] Update work listing keys
- [ ] Update work detail page keys
- [ ] Add dynamic key generation

### Phase 3: Wrap Queries
- [ ] Fix categories query in work/index.vue
- [ ] Fix category filtering query
- [ ] Add error handling
- [ ] Test SSR functionality

### Phase 4: Performance
- [ ] Implement selective field loading
- [ ] Add result limiting
- [ ] Configure caching strategies
- [ ] Optimize SSR performance

### Phase 5: Composable
- [ ] Create useContent composable
- [ ] Implement team members helper
- [ ] Implement work projects helper
- [ ] Implement work project helper
- [ ] Add work categories helper

### Phase 6: File Updates
- [ ] Update .pages.yml
- [ ] Update about/index.vue
- [ ] Update work/index.vue
- [ ] Update work/[slug].vue
- [ ] Test all pages

## Success Metrics

### Performance Improvements
- **Page Load Time**: Target 20% improvement
- **Time to First Content Paint**: Target 15% improvement
- **Hydration Performance**: Eliminate hydration mismatches
- **Bundle Size**: Maintain or reduce current size

### Code Quality Improvements
- **Consistency**: 100% standardized key naming
- **Error Handling**: Comprehensive error states
- **Maintainability**: Centralized content querying logic
- **Debugging**: Clear, descriptive cache keys

## Testing Strategy

### 1. Functional Testing
- [ ] Verify all content loads correctly
- [ ] Test category filtering functionality
- [ ] Validate project detail pages
- [ ] Ensure team member display works

### 2. Performance Testing
- [ ] Measure page load times before/after
- [ ] Monitor SSR performance
- [ ] Check for duplicate network requests
- [ ] Validate caching behavior

### 3. Edge Case Testing
- [ ] Test missing content scenarios
- [ ] Validate error states
- [ ] Check empty result handling
- [ ] Test network failure scenarios

## Notes for Implementation

### Best Practices
1. **Always wrap queryContent with useAsyncData**
2. **Use descriptive, unique cache keys**
3. **Implement proper error handling**
4. **Optimize queries with selective field loading**
5. **Consider server-side performance impact**

### Common Pitfalls to Avoid
- Duplicate cache keys across different contexts
- Missing error handling for failed queries
- Over-fetching data with unnecessary fields
- Blocking UI with synchronous content loading

---

**Created**: January 1, 2025
**Status**: Ready for Implementation
**Estimated Duration**: 4-5 hours total
