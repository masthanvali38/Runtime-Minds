import JSZip from 'jszip';
import { RepoFile } from '../types';
import { CodeAnalyzer } from '../services/analyzer';

export async function parseZipToFiles(file: File): Promise<RepoFile[]> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const files: RepoFile[] = [];

  const textExtensions = ['.py', '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.html', '.css', '.go', '.rs', '.yaml', '.yml'];

  for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
    // Ignore folders and hidden files / node_modules
    if (zipEntry.dir || relativePath.includes('node_modules/') || relativePath.includes('.git/') || relativePath.startsWith('.')) {
      continue;
    }

    const hasTextExt = textExtensions.some(ext => relativePath.toLowerCase().endsWith(ext));
    if (!hasTextExt && !relativePath.endsWith('Dockerfile') && !relativePath.endsWith('Makefile')) {
      continue;
    }

    try {
      const content = await zipEntry.async('string');
      const fileName = relativePath.split('/').pop() || relativePath;
      const language = CodeAnalyzer.detectLanguage(fileName);

      files.push({
        name: fileName,
        path: relativePath,
        content,
        language,
        size: content.length,
        lines: content.split('\n').length
      });
    } catch (e) {
      console.warn(`Could not read file from zip: ${relativePath}`, e);
    }
  }

  return files;
}
