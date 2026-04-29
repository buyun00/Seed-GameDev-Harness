import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import type { ConstitutionRuleCategory } from '@/types/constitution'

type LangStrings = {
  connectingToServer: string
  memoryEditor: string
  navAiActivity: string
  navConstitution: string
  navAutoMemory: string
  navKnowledge: string

  pageConstitutionTitle: string
  pageConstitutionSubtitle: string
  tabRulesView: string
  tabSourceDocs: string
  loading: string

  emptyNoAnalysis: string
  emptyNoAnalysisDesc: string
  emptyNoRulesInCategory: string
  emptyNoRulesDesc: (tab: string) => string

  pageAutoMemoryTitle: string
  pageAutoMemorySubtitle: string
  filterType: string
  filterStatus: string
  notResolved: string
  emptyNoMemory: string
  emptyNoMemoryDesc: string

  labelType: string
  labelStatus: string
  labelIndexed: string
  labelPath: string
  labelUpdated: string
  yes: string
  no: string
  contentHeading: string
  editButton: string

  pageKnowledgeTitle: string
  pageKnowledgeSubtitle: string
  categoriesTitle: string
  allCategory: string
  emptyNoKnowledge: string
  emptyNoKnowledgeDesc: string
  labelCategory: string
  labelLayer: string
  summaryHeading: string
  affinityAffectsConstitution: string
  affinityMemoryCandidate: string
  affinityReferenceOnly: string
  distillToRule: string
  distillToMemory: string

  analysisOutdatedAlert: string
  changedFiles: string
  analyzing: string
  reanalyzeNow: string
  runFirstAnalysis: string
  rerunAnalysis: string

  statusUpToDate: (date: string) => string
  statusOutdated: (date: string) => string
  statusNone: string

  tabEffective: string
  tabShadowed: string
  tabConflicting: string
  tabUnresolved: string

  moreRelations: (n: number) => string

  labelSource: string
  labelScope: string
  normalizedRule: string
  originalExcerpt: string
  relationsHeading: string
  editRuleButton: string

  labelTitle: string
  labelRuleContent: string
  labelEditIntent: string
  editIntentPlaceholder: string
  cancelButton: string
  generateProposal: string

  labelDescription: string
  editChangesPlaceholder: string

  reviewProposal: string
  rejectButton: string
  applyChanges: string

  fileNotFound: string
}

type I18nStrings = LangStrings & {
  statusLabel: (status: string) => string
  relationLabel: (relationType: string) => string
  ruleCategoryLabel: (category: ConstitutionRuleCategory) => string
}

const translations: Record<string, LangStrings> = {
  en: {
    connectingToServer: 'Connecting to Memory Server...',
    memoryEditor: 'Memory Editor',
    navAiActivity: 'AI Activity',
    navConstitution: 'Constitution',
    navAutoMemory: 'Auto Memory',
    navKnowledge: 'Knowledge',

    pageConstitutionTitle: 'Constitution',
    pageConstitutionSubtitle: 'Claude Code rule system management',
    tabRulesView: 'Rules View',
    tabSourceDocs: 'Source Documents',
    loading: 'Loading...',

    emptyNoAnalysis: 'No analysis yet',
    emptyNoAnalysisDesc: 'Run your first analysis to extract and categorize rules from your CLAUDE.md files.',
    emptyNoRulesInCategory: 'No rules in this category',
    emptyNoRulesDesc: (tab) => `No ${tab} rules found in the current analysis.`,

    pageAutoMemoryTitle: 'Auto Memory',
    pageAutoMemorySubtitle: 'Claude Code automatic memory system',
    filterType: 'Type',
    filterStatus: 'Status',
    notResolved: 'Not resolved',
    emptyNoMemory: 'No memory objects',
    emptyNoMemoryDesc: 'No auto memory found for this project.',

    labelType: 'Type',
    labelStatus: 'Status',
    labelIndexed: 'Indexed',
    labelPath: 'Path',
    labelUpdated: 'Updated',
    yes: 'Yes',
    no: 'No',
    contentHeading: 'Content',
    editButton: 'Edit',

    pageKnowledgeTitle: 'Project Knowledge',
    pageKnowledgeSubtitle: 'Project documentation and knowledge objects',
    categoriesTitle: 'Categories',
    allCategory: 'All',
    emptyNoKnowledge: 'No knowledge objects',
    emptyNoKnowledgeDesc: 'No project knowledge documents found.',
    labelCategory: 'Category',
    labelLayer: 'Layer',
    summaryHeading: 'Summary',
    affinityAffectsConstitution: 'Affects Constitution',
    affinityMemoryCandidate: 'Memory Candidate',
    affinityReferenceOnly: 'Reference Only',
    distillToRule: 'Distill to Rule',
    distillToMemory: 'Distill to Memory',

    analysisOutdatedAlert: 'Source files have been updated, analysis results are outdated',
    changedFiles: 'Changed:',
    analyzing: 'Analyzing...',
    reanalyzeNow: 'Re-analyze Now',
    runFirstAnalysis: 'Run First Analysis',
    rerunAnalysis: 'Re-run Analysis',

    statusUpToDate: (date) => `Analysis up to date (last analyzed: ${date})`,
    statusOutdated: (date) => `Analysis outdated (last analyzed: ${date})`,
    statusNone: 'No analysis has been run yet',

    tabEffective: 'Effective',
    tabShadowed: 'Shadowed',
    tabConflicting: 'Conflicting',
    tabUnresolved: 'Unresolved',

    moreRelations: (n) => `+${n} more`,

    labelSource: 'Source',
    labelScope: 'Scope',
    normalizedRule: 'Normalized Rule',
    originalExcerpt: 'Original Excerpt',
    relationsHeading: 'Relations',
    editRuleButton: 'Open Document',

    labelTitle: 'Title',
    labelRuleContent: 'Rule Content',
    labelEditIntent: 'Edit Intent',
    editIntentPlaceholder: 'Describe what you\'re changing and why...',
    cancelButton: 'Cancel',
    generateProposal: 'Generate Proposal',

    labelDescription: 'Description',
    editChangesPlaceholder: 'Describe your changes...',

    reviewProposal: 'Review Proposal',
    rejectButton: 'Reject',
    applyChanges: 'Apply Changes',

    fileNotFound: 'Not found',
  },

  zh: {
    connectingToServer: '正在连接到记忆服务器...',
    memoryEditor: '记忆编辑器',
    navAiActivity: 'AI 活动',
    navConstitution: '规则集',
    navAutoMemory: '自动记忆',
    navKnowledge: '项目知识',

    pageConstitutionTitle: '规则集',
    pageConstitutionSubtitle: 'Claude Code 规则系统管理',
    tabRulesView: '规则视图',
    tabSourceDocs: '源文档',
    loading: '加载中...',

    emptyNoAnalysis: '尚无分析结果',
    emptyNoAnalysisDesc: '运行首次分析，从 CLAUDE.md 文件中提取并归类规则。',
    emptyNoRulesInCategory: '此分类下暂无规则',
    emptyNoRulesDesc: (tab) => `当前分析中未找到 ${tab} 状态的规则。`,

    pageAutoMemoryTitle: '自动记忆',
    pageAutoMemorySubtitle: 'Claude Code 自动记忆系统',
    filterType: '类型',
    filterStatus: '状态',
    notResolved: '未解析',
    emptyNoMemory: '暂无记忆对象',
    emptyNoMemoryDesc: '该项目没有自动记忆。',

    labelType: '类型',
    labelStatus: '状态',
    labelIndexed: '已索引',
    labelPath: '路径',
    labelUpdated: '更新时间',
    yes: '是',
    no: '否',
    contentHeading: '内容',
    editButton: '编辑',

    pageKnowledgeTitle: '项目知识',
    pageKnowledgeSubtitle: '项目文档与知识对象',
    categoriesTitle: '分类',
    allCategory: '全部',
    emptyNoKnowledge: '暂无知识对象',
    emptyNoKnowledgeDesc: '未找到项目知识文档。',
    labelCategory: '分类',
    labelLayer: '层次归属',
    summaryHeading: '摘要',
    affinityAffectsConstitution: '影响规则集',
    affinityMemoryCandidate: '记忆候选',
    affinityReferenceOnly: '仅供参考',
    distillToRule: '提炼为规则',
    distillToMemory: '提炼为记忆',

    analysisOutdatedAlert: '检测到源文件已更新，分析结果已过期',
    changedFiles: '已变更：',
    analyzing: '分析中...',
    reanalyzeNow: '立即重新分析',
    runFirstAnalysis: '运行首次分析',
    rerunAnalysis: '重新分析',

    statusUpToDate: (date) => `分析结果最新（上次分析：${date}）`,
    statusOutdated: (date) => `分析结果已过期（上次分析：${date}）`,
    statusNone: '尚未运行分析',

    tabEffective: '有效',
    tabShadowed: '被覆盖',
    tabConflicting: '冲突',
    tabUnresolved: '未解决',

    moreRelations: (n) => `+${n} 条更多`,

    labelSource: '来源',
    labelScope: '作用域',
    normalizedRule: '规范化规则',
    originalExcerpt: '原始摘录',
    relationsHeading: '关联',
    editRuleButton: '打开文档',

    labelTitle: '标题',
    labelRuleContent: '规则内容',
    labelEditIntent: '编辑意图',
    editIntentPlaceholder: '描述你要修改的内容及原因...',
    cancelButton: '取消',
    generateProposal: '生成提案',

    labelDescription: '描述',
    editChangesPlaceholder: '描述你的改动...',

    reviewProposal: '审查提案',
    rejectButton: '拒绝',
    applyChanges: '应用更改',

    fileNotFound: '未找到',
  },

  ja: {
    connectingToServer: 'メモリサーバーに接続中...',
    memoryEditor: 'メモリエディタ',
    navAiActivity: 'AI アクティビティ',
    navConstitution: 'ルールセット',
    navAutoMemory: '自動メモリ',
    navKnowledge: 'プロジェクト知識',

    pageConstitutionTitle: 'ルールセット',
    pageConstitutionSubtitle: 'Claude Code ルールシステム管理',
    tabRulesView: 'ルール一覧',
    tabSourceDocs: 'ソースドキュメント',
    loading: '読み込み中...',

    emptyNoAnalysis: '分析結果なし',
    emptyNoAnalysisDesc: '最初の分析を実行して、CLAUDE.md ファイルからルールを抽出・分類します。',
    emptyNoRulesInCategory: 'このカテゴリにルールがありません',
    emptyNoRulesDesc: (tab) => `現在の分析に ${tab} 状態のルールが見つかりません。`,

    pageAutoMemoryTitle: '自動メモリ',
    pageAutoMemorySubtitle: 'Claude Code 自動メモリシステム',
    filterType: 'タイプ',
    filterStatus: 'ステータス',
    notResolved: '未解決',
    emptyNoMemory: 'メモリオブジェクトなし',
    emptyNoMemoryDesc: 'このプロジェクトの自動メモリが見つかりません。',

    labelType: 'タイプ',
    labelStatus: 'ステータス',
    labelIndexed: 'インデックス済',
    labelPath: 'パス',
    labelUpdated: '更新日時',
    yes: 'はい',
    no: 'いいえ',
    contentHeading: '内容',
    editButton: '編集',

    pageKnowledgeTitle: 'プロジェクト知識',
    pageKnowledgeSubtitle: 'プロジェクトドキュメントと知識オブジェクト',
    categoriesTitle: 'カテゴリ',
    allCategory: 'すべて',
    emptyNoKnowledge: '知識オブジェクトなし',
    emptyNoKnowledgeDesc: 'プロジェクト知識ドキュメントが見つかりません。',
    labelCategory: 'カテゴリ',
    labelLayer: 'レイヤー',
    summaryHeading: '概要',
    affinityAffectsConstitution: 'ルールセットに影響',
    affinityMemoryCandidate: 'メモリ候補',
    affinityReferenceOnly: '参照のみ',
    distillToRule: 'ルールに蒸留',
    distillToMemory: 'メモリに蒸留',

    analysisOutdatedAlert: 'ソースファイルが更新されました。分析結果が古くなっています',
    changedFiles: '変更済み：',
    analyzing: '分析中...',
    reanalyzeNow: '今すぐ再分析',
    runFirstAnalysis: '最初の分析を実行',
    rerunAnalysis: '再分析',

    statusUpToDate: (date) => `分析結果は最新です（最終分析：${date}）`,
    statusOutdated: (date) => `分析結果が古くなっています（最終分析：${date}）`,
    statusNone: 'まだ分析が実行されていません',

    tabEffective: '有効',
    tabShadowed: '上書き済',
    tabConflicting: '競合',
    tabUnresolved: '未解決',

    moreRelations: (n) => `+${n} 件`,

    labelSource: 'ソース',
    labelScope: 'スコープ',
    normalizedRule: '正規化ルール',
    originalExcerpt: '元の抜粋',
    relationsHeading: '関連',
    editRuleButton: '文書を開く',

    labelTitle: 'タイトル',
    labelRuleContent: 'ルール内容',
    labelEditIntent: '編集意図',
    editIntentPlaceholder: '変更内容と理由を説明してください...',
    cancelButton: 'キャンセル',
    generateProposal: '提案を生成',

    labelDescription: '説明',
    editChangesPlaceholder: '変更内容を説明してください...',

    reviewProposal: '提案を確認',
    rejectButton: '却下',
    applyChanges: '変更を適用',

    fileNotFound: '見つかりません',
  },

  ko: {
    connectingToServer: '메모리 서버에 연결 중...',
    memoryEditor: '메모리 편집기',
    navAiActivity: 'AI 활동',
    navConstitution: '규칙 세트',
    navAutoMemory: '자동 메모리',
    navKnowledge: '프로젝트 지식',

    pageConstitutionTitle: '규칙 세트',
    pageConstitutionSubtitle: 'Claude Code 규칙 시스템 관리',
    tabRulesView: '규칙 보기',
    tabSourceDocs: '소스 문서',
    loading: '로딩 중...',

    emptyNoAnalysis: '분석 결과 없음',
    emptyNoAnalysisDesc: '첫 번째 분석을 실행하여 CLAUDE.md 파일에서 규칙을 추출하고 분류합니다.',
    emptyNoRulesInCategory: '이 카테고리에 규칙이 없습니다',
    emptyNoRulesDesc: (tab) => `현재 분석에서 ${tab} 상태의 규칙을 찾을 수 없습니다.`,

    pageAutoMemoryTitle: '자동 메모리',
    pageAutoMemorySubtitle: 'Claude Code 자동 메모리 시스템',
    filterType: '타입',
    filterStatus: '상태',
    notResolved: '해결되지 않음',
    emptyNoMemory: '메모리 객체 없음',
    emptyNoMemoryDesc: '이 프로젝트의 자동 메모리가 없습니다.',

    labelType: '타입',
    labelStatus: '상태',
    labelIndexed: '인덱스됨',
    labelPath: '경로',
    labelUpdated: '업데이트',
    yes: '예',
    no: '아니오',
    contentHeading: '내용',
    editButton: '편집',

    pageKnowledgeTitle: '프로젝트 지식',
    pageKnowledgeSubtitle: '프로젝트 문서 및 지식 객체',
    categoriesTitle: '카테고리',
    allCategory: '전체',
    emptyNoKnowledge: '지식 객체 없음',
    emptyNoKnowledgeDesc: '프로젝트 지식 문서를 찾을 수 없습니다.',
    labelCategory: '카테고리',
    labelLayer: '레이어',
    summaryHeading: '요약',
    affinityAffectsConstitution: '규칙 세트에 영향',
    affinityMemoryCandidate: '메모리 후보',
    affinityReferenceOnly: '참조 전용',
    distillToRule: '규칙으로 추출',
    distillToMemory: '메모리로 추출',

    analysisOutdatedAlert: '소스 파일이 업데이트되었습니다. 분석 결과가 오래되었습니다',
    changedFiles: '변경됨：',
    analyzing: '분석 중...',
    reanalyzeNow: '지금 재분석',
    runFirstAnalysis: '첫 번째 분석 실행',
    rerunAnalysis: '재분석',

    statusUpToDate: (date) => `분석 결과가 최신입니다 (마지막 분석: ${date})`,
    statusOutdated: (date) => `분석 결과가 오래되었습니다 (마지막 분석: ${date})`,
    statusNone: '아직 분석이 실행되지 않았습니다',

    tabEffective: '유효',
    tabShadowed: '덮어쓰기됨',
    tabConflicting: '충돌',
    tabUnresolved: '미해결',

    moreRelations: (n) => `+${n} 개 더`,

    labelSource: '소스',
    labelScope: '범위',
    normalizedRule: '정규화된 규칙',
    originalExcerpt: '원본 발췌',
    relationsHeading: '관계',
    editRuleButton: '문서 열기',

    labelTitle: '제목',
    labelRuleContent: '규칙 내용',
    labelEditIntent: '편집 의도',
    editIntentPlaceholder: '변경 내용과 이유를 설명해주세요...',
    cancelButton: '취소',
    generateProposal: '제안 생성',

    labelDescription: '설명',
    editChangesPlaceholder: '변경 사항을 설명해주세요...',

    reviewProposal: '제안 검토',
    rejectButton: '거부',
    applyChanges: '변경 사항 적용',

    fileNotFound: '찾을 수 없음',
  },
}

const nameToCode: Record<string, string> = {
  english: 'en',
  '中文': 'zh', chinese: 'zh',
  '日本語': 'ja', japanese: 'ja',
  '한국어': 'ko', korean: 'ko',
}

const statusLabels: Record<string, Record<string, string>> = {
  en: {
    effective: 'Effective',
    shadowed: 'Shadowed',
    conflicting: 'Conflicting',
    unresolved: 'Unresolved',
  },
  zh: {
    effective: '有效',
    shadowed: '被覆盖',
    conflicting: '冲突',
    unresolved: '未解决',
  },
  ja: {
    effective: '有効',
    shadowed: '上書き',
    conflicting: '競合',
    unresolved: '未解決',
  },
  ko: {
    effective: '유효',
    shadowed: '가려짐',
    conflicting: '충돌',
    unresolved: '미해결',
  },
}

const relationLabels: Record<string, Record<string, string>> = {
  en: {
    shadowed_by: 'Shadowed By',
    conflicts_with: 'Conflicts With',
    overlaps_with: 'Overlaps With',
    reinforced_by: 'Reinforced By',
    more_specific_than: 'More Specific Than',
    likely_supersedes: 'Likely Supersedes',
  },
  zh: {
    shadowed_by: '被覆盖',
    conflicts_with: '冲突',
    overlaps_with: '重叠',
    reinforced_by: '被强化',
    more_specific_than: '更具体',
    likely_supersedes: '可能取代',
  },
  ja: {
    shadowed_by: '上位ルールに吸収',
    conflicts_with: '競合',
    overlaps_with: '重複',
    reinforced_by: '補強される',
    more_specific_than: 'より具体的',
    likely_supersedes: '置き換える可能性',
  },
  ko: {
    shadowed_by: '상위 규칙에 가려짐',
    conflicts_with: '충돌',
    overlaps_with: '겹침',
    reinforced_by: '보강됨',
    more_specific_than: '더 구체적',
    likely_supersedes: '대체 가능',
  },
}

const categoryLabels: Record<string, Record<ConstitutionRuleCategory, string>> = {
  en: {
    language_output: 'Language & Output',
    core_principles: 'Core Principles',
    agent_collaboration: 'Agent Collaboration',
    tools_commands: 'Tools & Commands',
    escalation_decision: 'Escalation & Decisions',
    memory_context: 'Memory & Context',
    activation_conditions: 'Activation Conditions',
    safety_constraints: 'Safety Constraints',
    other: 'Other',
  },
  zh: {
    language_output: '语言与输出',
    core_principles: '核心原则',
    agent_collaboration: 'Agent/团队协作',
    tools_commands: '工具与命令',
    escalation_decision: '升级与决策',
    memory_context: '记忆与上下文',
    activation_conditions: '激活条件',
    safety_constraints: '安全限制',
    other: '其他',
  },
  ja: {
    language_output: '言語と出力',
    core_principles: '中核原則',
    agent_collaboration: 'Agent/チーム連携',
    tools_commands: 'ツールとコマンド',
    escalation_decision: 'エスカレーションと意思決定',
    memory_context: '記憶とコンテキスト',
    activation_conditions: '有効化条件',
    safety_constraints: '安全制約',
    other: 'その他',
  },
  ko: {
    language_output: '언어 및 출력',
    core_principles: '핵심 원칙',
    agent_collaboration: 'Agent/팀 협업',
    tools_commands: '도구 및 명령',
    escalation_decision: '승급 및 의사결정',
    memory_context: '메모리 및 컨텍스트',
    activation_conditions: '활성화 조건',
    safety_constraints: '안전 제약',
    other: '기타',
  },
}

function resolveCode(raw: string): string {
  if (!raw) return 'en'
  const lower = raw.toLowerCase().trim()
  if (translations[lower]) return lower
  return nameToCode[raw.trim()] || nameToCode[lower] || 'en'
}

export function useI18n() {
  const appStore = useAppStore()
  const lang = computed(() => resolveCode(appStore.language ?? ''))
  const strings = computed<I18nStrings>(() => {
    const code = lang.value
    const base = translations[code] ?? translations.en
    return {
      ...base,
      statusLabel: (status: string) => statusLabels[code]?.[status] ?? statusLabels.en[status] ?? status,
      relationLabel: (relationType: string) => relationLabels[code]?.[relationType] ?? relationLabels.en[relationType] ?? relationType,
      ruleCategoryLabel: (category: ConstitutionRuleCategory) => categoryLabels[code]?.[category] ?? categoryLabels.en[category] ?? category,
    }
  })
  return new Proxy({} as I18nStrings, {
    get(_target, prop) {
      if (prop === 'value') {
        return strings.value
      }
      return strings.value[prop as keyof I18nStrings]
    },
  })
}
