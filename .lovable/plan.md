# Production build verification

## Goal
Compile the complete website using its existing production build and prerendering process.

## Steps
1. Run the configured production build, including the client bundle, security guard, operation-document generation, and public-page prerendering.
2. If compilation fails, trace each reported error to its source and apply only the minimum required fixes.
3. Re-run the production build until it completes successfully.
4. Verify that the generated homepage and representative public pages contain prerendered content and that the sitemap is produced.
5. Report the final build result and any warnings that remain.

## Scope
No design, content, database, publishing, or deployment changes are included unless a compilation error requires a source correction.
