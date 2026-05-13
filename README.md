# Website Printer Module Preview

This repo now hosts a Vite preview shell for the portable Website Printer module.

The module intended for Agency OS lives at:

```text
src/modules/website-printer
```

## Local Preview

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Agency OS Merge Notes

- Copy `src/modules/website-printer` into the main dashboard at the same path.
- Replace `LocalWebsitePrinterRepository` with a Supabase-backed implementation that satisfies `WebsitePrinterRepository`.
- Wire `WebsitePrinterPage` into the protected route shell and module registry.
- Replace `src/app/module-preview.css` with the dashboard Tailwind/design-system styling.
- Keep Company Spy server-side only; do not expose provider keys in browser code.
