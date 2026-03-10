import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom doesn't support scrollTo, so we mock it
window.HTMLElement.prototype.scrollTo = vi.fn();
