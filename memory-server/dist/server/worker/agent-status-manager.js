const AGENT_DEFINITIONS = [
    { id: 'leader', name: 'Leader', role: '团队协调者 — 任务分级、路由决策、方向仲裁', emoji: '🎯' },
    { id: 'builder', name: 'Builder', role: '实现专家 — 编写功能、修复 bug、交付代码', emoji: '🛠️' },
    { id: 'researcher', name: 'Researcher', role: '调查专家 — 信息搜集、根因分析、方案调研', emoji: '🔍' },
    { id: 'reviewer', name: 'Reviewer', role: '审查专家 — 代码审查、质量把控、反馈优化', emoji: '👁️' },
    { id: 'unity-pilot', name: 'Unity Pilot', role: 'Unity 操作员 — 场景编辑、资源管理、引擎操作', emoji: '🎮' },
    { id: 'chat', name: 'Chat', role: '对话助手 — 直接与用户交互、解答问题', emoji: '💬' },
];
export class AgentStatusManager {
    agents = new Map();
    sseEmitter;
    taskQueue = [];
    constructor(sseEmitter) {
        this.sseEmitter = sseEmitter;
        for (const def of AGENT_DEFINITIONS) {
            this.agents.set(def.id, {
                ...def,
                status: 'idle',
                currentTask: '',
                progress: '',
                startedAt: null,
                updatedAt: new Date().toISOString(),
            });
        }
    }
    getAgent(id) {
        return this.agents.get(id);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    setStatus(id, status, task = '') {
        const agent = this.agents.get(id);
        if (!agent)
            return;
        agent.status = status;
        if (task)
            agent.currentTask = task;
        if (status === 'working' && !agent.startedAt) {
            agent.startedAt = new Date().toISOString();
        }
        if (status === 'idle' || status === 'completed' || status === 'error' || status === 'waiting') {
            agent.startedAt = null;
        }
        agent.updatedAt = new Date().toISOString();
        this.broadcast(agent);
    }
    setTask(id, task) {
        const agent = this.agents.get(id);
        if (!agent)
            return;
        agent.currentTask = task;
        agent.updatedAt = new Date().toISOString();
        this.broadcast(agent);
    }
    setProgress(id, progress) {
        const agent = this.agents.get(id);
        if (!agent)
            return;
        agent.progress = progress;
        agent.updatedAt = new Date().toISOString();
        this.broadcast(agent);
    }
    enqueueTask(agentId, task) {
        this.taskQueue.push({ agentId, task });
        const agent = this.agents.get(agentId);
        if (agent && agent.status === 'idle') {
            this.setStatus(agentId, 'waiting', task);
        }
    }
    startWork(agentId, task) {
        this.setStatus(agentId, 'working', task);
    }
    completeWork(agentId, result = '') {
        this.setStatus(agentId, 'completed', result || '任务完成');
        setTimeout(() => {
            const agent = this.agents.get(agentId);
            if (agent && agent.status === 'completed') {
                this.processQueue(agentId);
            }
        }, 3000);
    }
    failWork(agentId, error) {
        this.setStatus(agentId, 'error', error);
        setTimeout(() => {
            const agent = this.agents.get(agentId);
            if (agent && agent.status === 'error') {
                this.setStatus(agentId, 'idle', '');
            }
        }, 5000);
    }
    processQueue(agentId) {
        const idx = this.taskQueue.findIndex(t => t.agentId === agentId);
        if (idx !== -1) {
            const next = this.taskQueue[idx];
            this.taskQueue.splice(idx, 1);
            this.startWork(agentId, next.task);
        }
        else {
            this.setStatus(agentId, 'idle', '');
        }
    }
    getQueueLength(agentId) {
        return this.taskQueue.filter(t => t.agentId === agentId).length;
    }
    broadcast(agent) {
        this.sseEmitter.emit('agent:status_changed', {
            agent: { ...agent },
        });
    }
}
