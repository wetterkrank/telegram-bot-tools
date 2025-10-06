## Project Instructions

This is a collection of web-based Telegram bot tools.

## Conventions & Code Style

### General

- Use `yarn` instead of `npm`
- Use TypeScript for all new code
- Prefer functional components over class-based
- Use Svelte 5 runes syntax (`$state`, `$props`, `$derived`)
- Use Bootstrap 5 for styling

### Naming

- Use PascalCase for component and component file names: `MyComponent`
- Use camelCase for variables and functions
- Test files: `*.test.ts` for unit and component tests

### Svelte Components

- Use `<script lang="ts">` for TypeScript
- Prefer runes over reactive statements where possible
- Use `$props()` for component props
- Use `$state()` for local state
- Use `$derived()` for computed values

### Testing

- Write unit tests with Vitest
- Avoid mocking where possible
- Do not mock stores if at all possible
- Avoid redundant assertions
- Use vitest browser mode for component testing
- To run specific unit tests, use `vitest <file_name>`

### Code Organization

- Keep components small and focused
- Separate business logic from UI components
- Use proper TypeScript types and interfaces

## Common Patterns

### Component Structure

```svelte
<script lang="ts">
	let { prop1, prop2 } = $props();
	let localState = $state(initialValue);
	let derivedValue = $derived(computation);
</script>

<!-- component markup -->
```

## Avoid

- Adding unnecessary dependencies without discussion
- Using deprecated Svelte 4 syntax
- Hardcoding values that should be configurable
- Skipping tests for new features
