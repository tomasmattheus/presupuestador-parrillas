import { useRef, useCallback } from 'react';
import type { PresupuestoFormHook } from '../../hooks/usePresupuestoForm';
import { useSettings } from '../../hooks/useSettings';
import PdfPage1Cover from './PdfPage1Cover';
import PdfPage2Detail from './PdfPage2Detail';
import PdfPage3Payment from './PdfPage3Payment';

interface Props {
  formHook: PresupuestoFormHook;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function usePrintPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  const printPages = useCallback((fileName?: string, preOpenedWin?: Window | null) => {
    const container = containerRef.current;
    if (!container) return;

    const pages = container.querySelectorAll('.page');
    if (pages.length === 0) return;

    const printWin = preOpenedWin || window.open('', '_blank', 'width=800,height=600');
    if (!printWin) return;

    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML)
      .join('\n');

    let pagesHtml = '';
    pages.forEach(p => { pagesHtml += p.outerHTML; });

    const docTitle = fileName || 'Presupuesto';

    printWin.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>${docTitle}</title>
${cssLinks}
<style>
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; background: white; }
  .page { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
</style>
</head><body>${pagesHtml}</body></html>`);

    printWin.document.close();

    const images = printWin.document.querySelectorAll('img');
    const imgPromises = Array.from(images).map(img =>
      img.complete ? Promise.resolve() : new Promise<void>(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      })
    );

    Promise.all(imgPromises).then(() => {
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 300);
    });
  }, []);

  return { containerRef, printPages };
}

export default function PresupuestoPreview({ formHook, containerRef }: Props) {
  const { lineItems, formData, calculateTotals, photoUrl } = formHook;
  const { settings } = useSettings();

  return (
    <div ref={containerRef} className="flex-1 h-full overflow-y-auto bg-[#e8eaed] flex flex-col items-center py-[30px] px-5 preview-panel">
      <PdfPage1Cover
        formData={formData}
        lineItems={lineItems}
        settings={settings}
        calculateTotals={calculateTotals}
        photoUrl={photoUrl}
      />
      <PdfPage2Detail
        formData={formData}
        lineItems={lineItems}
        settings={settings}
        calculateTotals={calculateTotals}
      />
      <PdfPage3Payment
        formData={formData}
        lineItems={lineItems}
        settings={settings}
        calculateTotals={calculateTotals}
      />
    </div>
  );
}
