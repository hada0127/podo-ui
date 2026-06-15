// Editing logic now lives in the headless @podo/edit-core package so the editor
// and studio hosts can share one engine (see report.md §5). This shim keeps the
// historical import path stable while delegating to the extracted core.
export * from "@podo/edit-core";
