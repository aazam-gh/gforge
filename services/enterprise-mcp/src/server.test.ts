import {describe,expect,it} from 'vitest'; import {server} from './server';
describe('enterprise MCP',()=>it('creates the MCP server boundary',()=>expect(server).toBeDefined()));
