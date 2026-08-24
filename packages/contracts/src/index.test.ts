import {describe,expect,it} from 'vitest'; import {CaseStatus} from './index';
describe('contracts',()=>it('keeps approval explicit',()=>expect(CaseStatus.safeParse('waiting_for_approval').success).toBe(true)));
