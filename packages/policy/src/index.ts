export const SENSITIVE_TOOLS = new Set(['update_billing_quantity']);
export function requiresApproval(toolName:string){return SENSITIVE_TOOLS.has(toolName);}
