export interface RepoFile {
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  lines: number;
  functions?: CodeSymbol[];
  classes?: CodeSymbol[];
  imports?: string[];
}

export interface CodeSymbol {
  name: string;
  kind: 'function' | 'class' | 'method' | 'variable';
  lineStart: number;
  lineEnd: number;
  parameters?: string[];
  docstring?: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  branch: string;
  files: RepoFile[];
  languages: { [lang: string]: number }; // percentage or line count
  totalFiles: number;
  totalFunctions: number;
  totalClasses: number;
  totalLines: number;
  lastAnalyzedAt: string;
  dependencyGraph?: DependencyNode[];
}

export interface DependencyNode {
  path: string;
  imports: string[];
  importedBy: string[];
  symbols: string[];
}

export interface BugAnalysis {
  id: string;
  bugDescription: string;
  repositoryId: string;
  timestamp: string;
  summary: string;
  confidence: number; // 0 - 100
  rootCause: {
    file: string;
    symbolName?: string;
    lineStart?: number;
    lineEnd?: number;
    incorrectBehavior: string;
    explanation: string;
    mechanism: string;
  };
  relevantCode: {
    file: string;
    language: string;
    lineStart: number;
    lineEnd: number;
    code: string;
  };
  suggestedFix: {
    file: string;
    currentCode: string;
    suggestedCode: string;
    explanation: string;
    diffSnippet?: string;
    isApplied?: boolean;
  };
  generatedTest: {
    file: string;
    testName: string;
    language: string;
    code: string;
    description: string;
  };
  verification: {
    status: 'passed' | 'failed' | 'not_run';
    executionTimeMs?: number;
    assertionsCount?: number;
    passedAssertions?: number;
    outputLog: string;
    stackTrace?: string;
  };
}

export interface BlastRadiusResult {
  id: string;
  repositoryId: string;
  timestamp: string;
  changedComponent: {
    file: string;
    symbolName?: string;
    symbolKind?: 'file' | 'function' | 'class';
    proposedChange?: string;
  };
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  impactScore: number; // 0 - 100
  impactMap: {
    root: string;
    nodes: ImpactNode[];
  };
  affectedComponents: AffectedComponent[];
  riskAreas: RiskArea[];
  recommendedTests: RecommendedTest[];
}

export interface ImpactNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'function' | 'test' | 'api';
  depth: number;
  impactLevel: 'direct' | 'downstream' | 'indirect' | 'test';
  children?: string[]; // IDs
}

export interface AffectedComponent {
  file: string;
  functionOrClass?: string;
  relationship: 'Direct Importer' | 'Downstream Caller' | 'Data Model Dependent' | 'Test Suite' | 'API Consumer';
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

export interface RiskArea {
  domain: 'Authentication' | 'Payment' | 'Database' | 'API' | 'UI' | 'Tests' | 'Worker/Queue';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  caveat: string; // e.g. "Potentially affected based on static call graph"
}

export interface RecommendedTest {
  testFile: string;
  testCaseName: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  status: 'passed' | 'failed' | 'not_run';
}

export interface RepoDoctorReport {
  id: string;
  repositoryId: string;
  timestamp: string;
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  categoryScores: {
    codeQuality: number;
    testCoverage: number;
    dependencies: number;
    documentation: number;
    maintainability: number;
  };
  issues: RepoDoctorIssue[];
  metrics: {
    testCoveragePct: number;
    cyclomaticComplexityAvg: number;
    duplicatedLinesPct: number;
    commentRatioPct: number;
    outdatedDepsCount: number;
  };
}

export interface RepoDoctorIssue {
  id: string;
  category: 'codeQuality' | 'testCoverage' | 'dependencies' | 'documentation' | 'maintainability';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
  autoFixAvailable: boolean;
  suggestedPatch?: {
    file: string;
    original: string;
    replacement: string;
  };
}

export interface ActivityItem {
  id: string;
  type: 'bug_analysis' | 'fix_suggested' | 'tests_executed' | 'blast_radius' | 'repo_scan' | 'fix_applied';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
  relatedId?: string;
}

export interface RepositoryBug {
  id: string; // e.g. BUG-001
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'Logic Error' | 'Security Vulnerability' | 'Runtime Error' | 'API Problem' | 'Dependency Problem' | 'Code Quality' | 'Testing Gap' | 'Syntax Error';
  file: string;
  line: number;
  functionName?: string;
  className?: string;
  problem: string;
  why: string;
  evidence: string;
  suggestedFix: {
    file: string;
    currentCode: string;
    suggestedCode: string;
    explanation: string;
  };
  verificationMethod: string;
  generatedTest?: {
    file: string;
    testName: string;
    code: string;
    language: string;
    description: string;
  };
  confidence: number;
  status: 'open' | 'fixed' | 'verified';
  verificationResult?: {
    status: 'verified' | 'not_verified';
    outputLog: string;
    timestamp: string;
    durationMs: number;
  };
}

export interface FileHealthSummary {
  file: string;
  path: string;
  fileType: 'source' | 'config' | 'test' | 'documentation' | 'other';
  language: string;
  lines: number;
  functionsCount: number;
  classesCount: number;
  status: 'analyzed' | 'skipped';
  skipReason?: string;
  healthScore: number; // 0 - 100
  isHealthy: boolean; // No unresolved findings
  issuesCount: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  bugIds: string[];
}

export interface RepositoryWideBugReport {
  repositoryId: string;
  repositoryName: string;
  timestamp: string;
  filesDiscovered: number;
  filesAnalyzed: number;
  filesSkipped: number;
  sourceFilesCount: number;
  configFilesCount: number;
  testFilesCount: number;
  docFilesCount: number;
  functionsAnalyzed: number;
  classesAnalyzed: number;
  analysisCoveragePct: number;
  healthyFilesCount: number;
  healthyFilesPct: number;
  repositoryHealthScore: number; // 0 - 100
  healthBreakdown: {
    codeQuality: number;
    security: number;
    testing: number;
    dependencies: number;
    maintainability: number;
  };
  issuesSummary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  bugs: RepositoryBug[];
  fileHealth: FileHealthSummary[];
  skippedFiles: { path: string; reason: string }[];
}

export interface TestSuite {
  id: string;
  file: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  status: 'passed' | 'failed' | 'running' | 'idle';
  tests: {
    id: string;
    name: string;
    status: 'passed' | 'failed' | 'skipped' | 'not_run';
    durationMs: number;
    error?: string;
    stackTrace?: string;
  }[];
}
