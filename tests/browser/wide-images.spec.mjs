import { test, expect } from '@playwright/test';
import { wideImageContracts } from './wide-image-contracts.mjs';
wideImageContracts(test, expect);
