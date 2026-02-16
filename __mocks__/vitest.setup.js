import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';
import * as jestChrome from 'jest-chrome';

globalThis.jest = vi; // Need to mock vi for jest-chrome
expect.extend(matchers);
Object.assign(globalThis, jestChrome);
