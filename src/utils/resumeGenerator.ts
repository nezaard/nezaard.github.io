import cvPdfUrl from '../../CV Nezaard.pdf?url';

export function downloadResume() {
  const link = document.createElement('a');
  link.href = cvPdfUrl;
  link.download = 'CV Nezaard.pdf';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

