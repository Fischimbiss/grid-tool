import '@testing-library/jest-dom';
import './i18n';

// polyfill for TextEncoder/TextDecoder in Jest environment
import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder as any;
