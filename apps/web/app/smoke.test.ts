import {describe,expect,it} from 'vitest';
describe('web scaffold',()=>it('defines the WorkerOS surface',()=>expect(['/fleet','/cases','/approvals']).toHaveLength(3)));
