/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { MappingModal } from './components/MappingModal';
import { PostScanSummary } from './components/PostScanSummary';
import { VisualRepositoryExplorer } from './components/VisualRepositoryExplorer';
import { Bug2FixView } from './components/Bug2FixView';
import { BlastRadiusView } from './components/BlastRadiusView';
import { RepoDoctorView } from './components/RepoDoctorView';
import { RepositoryView } from './components/RepositoryView';
import { TestResultsView } from './components/TestResultsView';
import { SAMPLE_REPOSITORIES } from './data/sampleRepositories';
import {
  Repository,
  RepoFile,
  BugAnalysis,
  BlastRadiusResult,
  RepoDoctorReport,
  RepoDoctorIssue,
  RepositoryWideBugReport,
  RepositoryBug
} from './types';
import { CodeAnalyzer } from './services/analyzer';
import { runBugAnalysis, runBlastRadiusAnalysis, executeTest, checkAiStatus } from './services/api';
import { parseZipToFiles } from './utils/zip';

export default function App() {
  const [repositories, setRepositories] = useState<Repository[]>(SAMPLE_REPOSITORIES);
  const [currentRepo, setCurrentRepo] = useState<Repository>(SAMPLE_REPOSITORIES[0]);
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isMappingModalOpen, setIsMappingModalOpen] = useState<boolean>(false);
  const [activeFileTarget, setActiveFileTarget] = useState<string | undefined>(undefined);

  // AI & Server status
  const [isAiEnabled, setIsAiEnabled] = useState<boolean>(true);
  const [modelName, setModelName] = useState<string>('gemini-3.5-flash');

  // Loading states
  const [isAnalyzingBug, setIsAnalyzingBug] = useState<boolean>(false);
  const [isAnalyzingBlast, setIsAnalyzingBlast] = useState<boolean>(false);
  const [isScanningDoctor, setIsScanningDoctor] = useState<boolean>(false);

  // Analysis State
  const [repoBugReport, setRepoBugReport] = useState<RepositoryWideBugReport>(() =>
    CodeAnalyzer.scanRepositoryWideBugs(SAMPLE_REPOSITORIES[0])
  );

  const [bugAnalysis, setBugAnalysis] = useState<BugAnalysis | null>(() =>
    CodeAnalyzer.analyzeBug(SAMPLE_REPOSITORIES[0], 'Users are logged out when refreshing the checkout page.')
  );

  const [blastResult, setBlastResult] = useState<BlastRadiusResult | null>(() =>
    CodeAnalyzer.calculateBlastRadius(SAMPLE_REPOSITORIES[0], 'src/payment.py', 'process_payment')
  );

  const [doctorReport, setDoctorReport] = useState<RepoDoctorReport>(() =>
    CodeAnalyzer.runRepoDoctor(SAMPLE_REPOSITORIES[0])
  );

  // Check AI model status
  useEffect(() => {
    checkAiStatus().then(status => {
      setIsAiEnabled(status.aiEnabled);
      if (status.model) setModelName(status.model);
    });
  }, []);

  // Map repository trigger
  const handleAnalyzeRepository = (urlOrName: string) => {
    setIsMappingModalOpen(true);
  };

  const handleMappingModalComplete = () => {
    setIsMappingModalOpen(false);
    setCurrentTab('post_scan');
  };

  // Re-run doctor scan
  const handleRescanDoctor = () => {
    setIsScanningDoctor(true);
    setTimeout(() => {
      const updated = CodeAnalyzer.runRepoDoctor(currentRepo);
      setDoctorReport(updated);
      setIsScanningDoctor(false);
    }, 450);
  };

  // Switch repository
  const handleSelectRepo = (repo: Repository) => {
    setCurrentRepo(repo);
    const newDoc = CodeAnalyzer.runRepoDoctor(repo);
    setDoctorReport(newDoc);
    setBlastResult(CodeAnalyzer.calculateBlastRadius(repo, repo.files[0].path));
    setRepoBugReport(CodeAnalyzer.scanRepositoryWideBugs(repo));
    setBugAnalysis(null);
  };

  // Upload ZIP
  const handleUploadZip = async (file: File) => {
    try {
      const extractedFiles = await parseZipToFiles(file);
      if (extractedFiles.length === 0) {
        alert('No readable source code files found in the uploaded ZIP.');
        return;
      }
      const repoName = file.name.replace(/\.zip$/i, '');
      const newRepo = CodeAnalyzer.analyzeRepository(extractedFiles, repoName);
      setRepositories(prev => [newRepo, ...prev]);
      setCurrentRepo(newRepo);
      setDoctorReport(CodeAnalyzer.runRepoDoctor(newRepo));
      setBlastResult(CodeAnalyzer.calculateBlastRadius(newRepo, newRepo.files[0].path));
      setRepoBugReport(CodeAnalyzer.scanRepositoryWideBugs(newRepo));
      setBugAnalysis(null);
      setIsMappingModalOpen(true);
    } catch (err) {
      console.error('Failed to parse uploaded ZIP:', err);
      alert('Failed to extract ZIP archive.');
    }
  };

  // Bug2Fix Analysis Handler
  const handleAnalyzeBug = async (desc: string, targetFile?: string) => {
    setIsAnalyzingBug(true);
    try {
      const result = await runBugAnalysis(currentRepo, desc);
      setBugAnalysis(result);
    } catch (err) {
      console.error('Error analyzing bug:', err);
    } finally {
      setIsAnalyzingBug(false);
    }
  };

  // Blast Radius Handler
  const handleAnalyzeImpact = async (file: string, symbol?: string, snippet?: string) => {
    setIsAnalyzingBlast(true);
    try {
      const result = await runBlastRadiusAnalysis(currentRepo, file, symbol, snippet);
      setBlastResult(result);
    } catch (err) {
      console.error('Blast radius calculation failed:', err);
    } finally {
      setIsAnalyzingBlast(false);
    }
  };

  // Apply fix into active repository state
  const handleApplyFix = (fix: { file: string; currentCode: string; suggestedCode: string }) => {
    const updated = CodeAnalyzer.applyFixToRepository(currentRepo, fix);
    setCurrentRepo(updated);
    setRepositories(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setDoctorReport(CodeAnalyzer.runRepoDoctor(updated));
    setRepoBugReport(CodeAnalyzer.scanRepositoryWideBugs(updated));
  };

  // Apply RepoDoctor auto-fix
  const handleApplyDoctorFix = (issue: RepoDoctorIssue) => {
    if (issue.suggestedPatch) {
      const updated = CodeAnalyzer.applyFixToRepository(currentRepo, {
        file: issue.suggestedPatch.file,
        currentCode: issue.suggestedPatch.original,
        suggestedCode: issue.suggestedPatch.replacement
      });
      setCurrentRepo(updated);
      setRepositories(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      setDoctorReport(CodeAnalyzer.runRepoDoctor(updated));
      setRepoBugReport(CodeAnalyzer.scanRepositoryWideBugs(updated));
    }
  };

  // Re-scan repository bugs
  const handleRescanRepoBugs = () => {
    setRepoBugReport(CodeAnalyzer.scanRepositoryWideBugs(currentRepo));
  };

  // Apply bug fix from item
  const handleApplyBugItemFix = (bug: RepositoryBug) => {
    handleApplyFix(bug.suggestedFix);
  };

  // Test Runner handler
  const handleExecuteSuite = async (testFile?: string, testName?: string) => {
    return await executeTest(testFile, testName);
  };

  // Verify bug fix with tests
  const handleVerifyBugItem = async (bug: RepositoryBug) => {
    const testFile = bug.generatedTest?.file || 'tests/test_fix.py';
    const testName = bug.generatedTest?.testName || 'test_regression';
    const res = await handleExecuteSuite(testFile, testName);
    return {
      status: (res.status === 'passed' ? 'verified' : 'not_verified') as 'verified' | 'not_verified',
      outputLog: res.output
    };
  };

  // Quick module action from map or cards
  const handleNavigateToModule = (module: 'bug2fix' | 'blastradius' | 'repodoctor' | 'explorer' | 'code_viewer' | 'tests', file?: string) => {
    if (file) setActiveFileTarget(file);
    setCurrentTab(module);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0f172a] flex flex-col font-sans">
      {/* Minimal Top Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRepo={currentRepo}
        repositories={repositories}
        onSelectRepo={handleSelectRepo}
        onGoHome={() => setCurrentTab('landing')}
      />

      {/* Main Experience View */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingHero
            currentRepo={currentRepo}
            repositories={repositories}
            onSelectRepo={handleSelectRepo}
            onAnalyzeRepository={handleAnalyzeRepository}
            onUploadZip={handleUploadZip}
            onSelectFile={file => setActiveFileTarget(file.path)}
            onQuickModuleAction={(action, filePath) => {
              setActiveFileTarget(filePath);
              if (action === 'bug') setCurrentTab('bug2fix');
              else if (action === 'blast') setCurrentTab('blastradius');
              else setCurrentTab('code_viewer');
            }}
          />
        )}

        {currentTab === 'post_scan' && (
          <PostScanSummary
            repository={currentRepo}
            bugReport={repoBugReport}
            onNavigateToModule={handleNavigateToModule}
            onReMap={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'explorer' && (
          <VisualRepositoryExplorer
            repository={currentRepo}
            onNavigateToModule={handleNavigateToModule}
            onSelectFileDetail={file => setActiveFileTarget(file.path)}
            onBackToSummary={() => setCurrentTab('post_scan')}
          />
        )}

        {currentTab === 'bug2fix' && (
          <Bug2FixView
            repository={currentRepo}
            report={repoBugReport}
            analysis={bugAnalysis}
            isAnalyzing={isAnalyzingBug}
            onAnalyzeBug={handleAnalyzeBug}
            onApplyFix={handleApplyFix}
            onApplyBugItemFix={handleApplyBugItemFix}
            onVerifyBugItem={handleVerifyBugItem}
            onReRunTest={() => handleExecuteSuite('tests/test_auth_refresh_regression.py', 'test_session_persists_across_multiple_checkout_page_refreshes')}
            onRescanRepository={handleRescanRepoBugs}
            onUploadZip={handleUploadZip}
            initialTargetFile={activeFileTarget}
            onBackToSummary={() => setCurrentTab('post_scan')}
          />
        )}

        {currentTab === 'blastradius' && (
          <BlastRadiusView
            repository={currentRepo}
            result={blastResult}
            isAnalyzing={isAnalyzingBlast}
            onAnalyzeImpact={handleAnalyzeImpact}
            onRunTest={(file, name) => handleExecuteSuite(file, name)}
            initialTargetFile={activeFileTarget}
            onBackToSummary={() => setCurrentTab('post_scan')}
          />
        )}

        {currentTab === 'repodoctor' && (
          <RepoDoctorView
            repository={currentRepo}
            report={doctorReport}
            isScanning={isScanningDoctor}
            onRescan={handleRescanDoctor}
            onApplyIssueFix={handleApplyDoctorFix}
            onBackToSummary={() => setCurrentTab('post_scan')}
          />
        )}

        {currentTab === 'code_viewer' && (
          <div className="py-8 px-6 sm:px-10 max-w-7xl mx-auto">
            <RepositoryView
              repository={currentRepo}
              onSelectFileForBug={filePath => {
                setActiveFileTarget(filePath);
                setCurrentTab('bug2fix');
                handleAnalyzeBug(`Issue in ${filePath}`, filePath);
              }}
              onSelectFileForBlast={filePath => {
                setActiveFileTarget(filePath);
                setCurrentTab('blastradius');
                handleAnalyzeImpact(filePath);
              }}
              onUploadZip={handleUploadZip}
            />
          </div>
        )}

        {currentTab === 'tests' && (
          <div className="py-8 px-6 sm:px-10 max-w-7xl mx-auto">
            <TestResultsView
              repository={currentRepo}
              onExecuteSuite={handleExecuteSuite}
            />
          </div>
        )}
      </main>

      {/* Repository Analysis Progress Modal */}
      {isMappingModalOpen && (
        <MappingModal
          repoName={currentRepo.name}
          onComplete={handleMappingModalComplete}
        />
      )}
    </div>
  );
}
