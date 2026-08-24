import {describe,expect,it} from 'vitest'; import {TrueForgeAdapter} from './index';
describe('TrueForge adapter',()=>it('reports unavailable without credentials',()=>expect(new TrueForgeAdapter().state).toBe('unavailable')));
