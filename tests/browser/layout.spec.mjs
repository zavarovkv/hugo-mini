import { test, expect } from '@playwright/test';
import { layoutContracts } from './contracts.mjs';
layoutContracts(test, expect);
