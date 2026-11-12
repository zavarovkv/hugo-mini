import { test, expect } from '@playwright/test';
import { resumeContracts } from './resume-contracts.mjs';
resumeContracts(test, expect);
