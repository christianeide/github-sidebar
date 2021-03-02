import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';

// For mocking out chrome API
Object.assign(global, require('jest-chrome'));
