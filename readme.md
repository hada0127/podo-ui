# Podo UI

> Modern SCSS Module-based Design System

English | [한국어](./README.ko.md)

## Installation

```bash
npm install podo-ui
```

## Quick Start

### Apply Global SCSS

```typescript
// main.tsx
import 'podo-ui/global.scss';
import 'podo-ui/vite-fonts.scss'; // When using Vite
```

### Use in SCSS Modules

```scss
// component.module.scss
@use 'podo-ui/mixin' as *;

.myComponent {
  color: color(primary);
  margin: s(4);
  border-radius: r(2);
}
```

### React Components

```tsx
// Import individual components using named imports
import { Input, Textarea, Editor, EditorView, Avatar, Field, Pagination } from 'podo-ui';

// Or import components directly (legacy method)
import Input from 'podo-ui/react/atom/input';
import Avatar from 'podo-ui/react/atom/avatar';
import Field from 'podo-ui/react/molecule/field';
```

## Key Features

- CSS class-based design system
- Responsive grid system (PC 12, Tablet 6, Mobile 4)
- Color system with dark mode support
- React components (Avatar, Input, Textarea, Editor, Field)

## Documentation

For detailed usage, please refer to the [official documentation](https://podoui.com).

## Links

- [Official Documentation](https://podoui.com)
- [GitHub Repository](https://github.com/hada0127/podo-ui)
- [Report Issues](https://github.com/hada0127/podo-ui/issues)

## License

MIT
