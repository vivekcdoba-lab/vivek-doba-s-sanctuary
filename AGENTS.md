# Architecture rules

- Share framework labels and diagnostic offer constants across public pages to keep the approved messaging consistent.
- Use the shared public-navigation predicate with the existing published-content queries for desktop and mobile tabs so visibility stays consistent.
- Keep shared AccordionContent mounted and hide its closed state with CSS so collapsed answers remain in rendered HTML.
- Serve the client workbook unchanged from its public static path, embedded without sandboxing inside the existing protected admin layout, because it requires browser storage, printing and downloads.