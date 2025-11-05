---
description: 'React Best Practices for Next.js + TypeScript Applications'
applyTo: '**'
---

# React Best Practices

**Version:** 1.0  
**Last Updated:** November 2025  
**Target:** React Developers, Frontend Developers, Next.js + TypeScript Projects

---

## Overview

This document outlines essential React best practices for building maintainable, performant, and scalable user interfaces. These guidelines apply to all React components in Next.js applications.

---

## Component Design

### Functional Components

- **Prefer functional components** with hooks over class components
- **Use descriptive component names** that reflect their purpose
- **Keep components small and focused** - one component, one responsibility
- **Use composition over inheritance** - build complex UIs from simple components
- **Extract custom hooks** for reusable logic across components

### Component Structure

- **Use clear component hierarchy** with meaningful parent-child relationships
- **Avoid deeply nested component trees** - refactor when nesting exceeds 3-4 levels
- **Use fragment syntax** (`<>...</>`) to avoid unnecessary wrapper elements
- **Implement proper component boundaries** for error isolation

---

## State Management

### Local State

- **Lift state up** when multiple components need the same data
- **Use local state** for component-specific data that doesn't affect others
- **Avoid deep state nesting** - prefer flat state structures
- **Use functional state updates** when new state depends on previous state

### State Patterns

- **Consider Context API** for theme, user preferences, or app-wide settings
- **Use reducers** for complex state logic with multiple actions
- **Implement state machines** for complex UI flows with libraries like XState
- **Use URL state** for shareable, bookmarkable application states

### State Best Practices

- **Initialize state appropriately** - avoid undefined initial states
- **Handle loading and error states** explicitly
- **Use optimistic updates** for better perceived performance
- **Persist state** when appropriate (localStorage, sessionStorage, or server)

---

## Effects & Lifecycle

### useEffect Usage

- **Clean up effects** to prevent memory leaks (timers, subscriptions, event listeners)
- **Use useEffect dependencies correctly** - include all reactive values
- **Avoid infinite loops** by properly managing effect dependencies
- **Split effects** by concern - one effect per responsibility

### Effect Patterns

- **Prefer useLayoutEffect** only when you need to read DOM layout before paint
- **Use useCallback/useMemo** sparingly - React is optimized for re-renders
- **Handle async operations** properly with cleanup functions
- **Use AbortController** for cancellable async operations

---

## Performance Optimization

### Memoization

- **Use React.memo** for expensive components that re-render frequently with same props
- **Implement shouldComponentUpdate** or use memo when necessary
- **Memoize expensive calculations** with useMemo
- **Memoize callback functions** with useCallback when passed to optimized children

### Rendering Optimization

- **Use lazy loading** for code splitting with `React.lazy()` and `Suspense`
- **Optimize list rendering** with stable keys and virtualization for large lists
- **Avoid inline functions** in render - move to component level or use useCallback
- **Profile performance** with React DevTools Profiler

### Bundle Optimization

- **Split code** at logical boundaries (routes, features, heavy libraries)
- **Use dynamic imports** for conditional loading
- **Optimize dependencies** - prefer smaller, focused libraries
- **Monitor bundle size** and loading performance

---

## Hooks Best Practices

### Rules of Hooks

- **Call hooks at the top level** - never inside loops, conditions, or nested functions
- **Follow the rules of hooks** strictly to avoid bugs
- **Use ESLint rules** for hooks to catch violations

### Custom Hooks

- **Use custom hooks** to extract and reuse stateful logic
- **Name custom hooks** with "use" prefix
- **Compose hooks** for complex logic combinations
- **Test custom hooks** in isolation

### Built-in Hooks

- **Use useRef** for DOM access or mutable values that don't trigger re-renders
- **Use useReducer** for complex state transitions
- **Use useContext** for consuming context values
- **Use useImperativeHandle** sparingly for parent-child communication

---

## Data Flow & Props

### Props Design

- **Pass data down** through props, not sideways through global state
- **Use prop destructuring** for cleaner component signatures
- **Define prop types** with TypeScript interfaces or PropTypes
- **Provide default props** when appropriate
- **Use children prop** for flexible component composition

### Props Patterns

- **Avoid prop drilling** - use Context or component composition
- **Use render props** for advanced customization patterns
- **Implement compound components** for related component groups
- **Use forwardRef** for DOM access through props

---

## Error Handling

> For detailed error handling patterns, including `Response<T>`, `AppError`, and client-side handling, see [error-handling-guidelines.instructions.md](error-handling-guidelines.instructions.md).

---

## Accessibility

### Semantic HTML

- **Use semantic HTML** elements appropriately
- **Provide alt text** for images and meaningful labels for form controls
- **Ensure keyboard navigation** works for all interactive elements
- **Maintain sufficient color contrast** and consider color blindness

### ARIA Usage

- **Use ARIA attributes** when semantic HTML isn't sufficient
- **Test with screen readers** to ensure proper announcement
- **Implement focus management** for dynamic content
- **Use live regions** for dynamic content updates

---

## Code Organization

### File Structure

- **Organize by feature** rather than by type
- **Use index files** for clean imports
- **Separate concerns** - components, hooks, utils, types
- **Use consistent naming** conventions (see [naming-conventions.instructions.md](naming-conventions.instructions.md))

### Code Quality

- **Write readable code** with clear variable and function names
- **Add JSDoc comments** for complex logic
- **Use TypeScript** for type safety
- **Follow consistent formatting** with Prettier

---

## Advanced Patterns

### Higher-Order Components

- **Use HOCs** for cross-cutting concerns (logging, authentication)
- **Avoid overusing HOCs** - prefer hooks when possible
- **Compose HOCs** properly to avoid prop conflicts

### Render Props

- **Use render props** for sharing logic between components
- **Prefer hooks** over render props when possible
- **Document render prop APIs** clearly

### Context Patterns

- **Use context sparingly** - prefer props for most data flow
- **Split contexts** by domain to avoid unnecessary re-renders
- **Provide context consumers** with display names for debugging

---

## Performance Monitoring

### Metrics to Track

- **Render counts** with React DevTools
- **Bundle size** and loading performance
- **Runtime performance** with browser dev tools
- **Memory usage** and leak detection

### Optimization Strategies

- **Use React's built-in optimization** features
- **Profile before optimizing** - measure impact
- **Balance performance** with code maintainability
- **Document performance decisions** for future reference

---

## Summary

Following these React best practices ensures that your components are maintainable, performant, and user-friendly. Focus on:

- **Composition over inheritance**
- **Proper state management**
- **Performance-conscious coding**
- **Accessibility and testing**
- **Clean, readable code**

Remember that React is a library for building user interfaces - keep your components focused on presentation and delegate complex logic to custom hooks or external utilities.
