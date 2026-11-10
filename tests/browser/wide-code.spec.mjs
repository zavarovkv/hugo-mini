import { test, expect } from '@playwright/test';
import { wideCodeContracts } from './wide-code-contracts.mjs';
wideCodeContracts(test, expect);
