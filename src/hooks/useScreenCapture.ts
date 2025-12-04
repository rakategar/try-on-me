import html2canvas from "html2canvas";

export function useScreenCapture() {
  const captureScreen = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Capture error:", error);
      return null;
    }
  };

  const downloadImage = (dataUrl: string, filename: string = "capture.png") => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  return { captureScreen, downloadImage };
}
