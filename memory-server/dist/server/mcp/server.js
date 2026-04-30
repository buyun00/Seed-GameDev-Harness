import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerConstitutionTools } from './tools/constitution.js';
import { registerMemoryTools } from './tools/memory.js';
import { registerKnowledgeTools } from './tools/knowledge.js';
import { registerProposalTools } from './tools/proposal.js';
import { registerSystemTools } from './tools/system.js';
/**
 * Create an MCP server that shares the same AppContext (service layer)
 * with the HTTP API. In worker mode, both MCP and HTTP share Scanner,
 * Watcher, Cache, Writer, TaskQueue, Agent services, etc.
 *
 * In proxy mode (future), MCP tools can alternatively forward calls
 * to the worker's HTTP API via ensureWorkerStarted().
 */
export function createMcpServer(ctx) {
    const server = new McpServer({
        name: 'memory-server',
        version: '0.1.0',
    });
    registerConstitutionTools(server, ctx);
    registerMemoryTools(server, ctx);
    registerKnowledgeTools(server, ctx);
    registerProposalTools(server, ctx);
    registerSystemTools(server, ctx);
    return server;
}
/**
 * Future: create a lightweight proxy MCP server that forwards
 * tool calls to the worker's HTTP API. This is useful when MCP
 * is started as a separate process from the worker.
 */
export async function createProxyMcpServer(projectPath) {
    const { ensureWorkerStarted } = await import('../worker/spawner.js');
    const { port } = await ensureWorkerStarted(projectPath);
    const server = new McpServer({
        name: 'memory-server',
        version: '0.1.0',
    });
    server.tool('get_constitution_analysis', 'Get the current constitution analysis status and extracted rules', {}, async () => {
        const resp = await proxyGet(port, '/api/constitution/analysis');
        return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
    });
    server.tool('run_constitution_analysis', 'Analyze CLAUDE.md files and extract structured rule blocks', {}, async () => {
        const resp = await proxyPost(port, '/api/constitution/analyze');
        return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
    });
    server.tool('get_status', 'Get Seed MCP server status', {}, async () => {
        const resp = await proxyGet(port, '/api/status');
        return { content: [{ type: 'text', text: JSON.stringify(resp) }] };
    });
    return server;
}
async function proxyGet(port, path) {
    const resp = await fetch(`http://127.0.0.1:${port}${path}`);
    return resp.json();
}
async function proxyPost(port, path, body) {
    const resp = await fetch(`http://127.0.0.1:${port}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    return resp.json();
}
