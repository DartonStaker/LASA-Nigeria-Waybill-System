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
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", [210, 297]);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgProps = {
    width: canvas.width,
    height: canvas.height,
  };

  const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
  const renderWidth = imgProps.width * ratio;
  const renderHeight = imgProps.height * ratio;
  const offsetX = (pdfWidth - renderWidth) / 2;
  const offsetY = 15;

  const footerText = `Generated from LASA Electronics Waybill System • ${new Date()
    .toISOString()
    .slice(0, 10)}`;

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
    pdf.text(footerText, pdfWidth / 2, pdfHeight - 10, {
      align: "center",
    });
  }

  pdf.save(`${waybillNumber || "waybill"}.pdf`);
}

