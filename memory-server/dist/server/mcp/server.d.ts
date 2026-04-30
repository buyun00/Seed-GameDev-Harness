import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppContext } from '../types.js';
/**
 * Create an MCP server that shares the same AppContext (service layer)
 * with the HTTP API. In worker mode, both MCP and HTTP share Scanner,
 * Watcher, Cache, Writer, TaskQueue, Agent services, etc.
 *
 * In proxy mode (future), MCP tools can alternatively forward calls
 * to the worker's HTTP API via ensureWorkerStarted().
 */
export declare function createMcpServer(ctx: AppContext): McpServer;
/**
 * Future: create a lightweight proxy MCP server that forwards
 * tool calls to the worker's HTTP API. This is useful when MCP
 * is started as a separate process from the worker.
 */
export declare function createProxyMcpServer(projectPath: string): Promise<McpServer>;
