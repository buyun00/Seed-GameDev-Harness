export function emitAgentLog(emitter, source, message) {
    const label = source.charAt(0).toUpperCase() + source.slice(1);
    process.stderr.write(`[${label}] ${message}\n`);
    emitter.emit('agent:log', { source, message, ts: Date.now() });
}
