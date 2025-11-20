import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DEFAULT_COPY_COUNT = Number(
  process.env.NEXT_PUBLIC_WAYBILL_PDF_COPIES ?? 3,
);

export async function downloadWaybillPdf(
  element: HTMLElement,
  waybillNumber: string,
  copyCount: number = DEFAULT_COPY_COUNT,
) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgProps = {
    width: canvas.width,
    height: canvas.height,
  };

  const marginX = 6;
  const marginY = 10;

  const ratio = Math.min(
    (pdfWidth - marginX * 2) / imgProps.width,
    (pdfHeight - marginY * 2) / imgProps.height,
  );
  const renderWidth = imgProps.width * ratio;
  const renderHeight = imgProps.height * ratio;
  const offsetX = (pdfWidth - renderWidth) / 2;
  const offsetY = marginY;

  for (let copyIndex = 0; copyIndex < copyCount; copyIndex += 1) {
    if (copyIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      imageData,
      "PNG",
      offsetX,
      offsetY,
      renderWidth,
      renderHeight,
      undefined,
      "FAST",
    );

    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text(
      `Generated from LASA Electronics Waybill System • ${new Date()
        .toISOString()
        .slice(0, 10)}`,
      pdfWidth / 2,
      pdfHeight - marginY / 2,
      {
        align: "center",
      },
    );
  }

  pdf.save(`${waybillNumber || "waybill"}.pdf`);
}

