import {describe,expect,it} from 'vitest'; import {requiresApproval} from './index';
describe('policy',()=>it('gates billing quantity writes',()=>expect(requiresApproval('update_billing_quantity')).toBe(true)));
