// Downsize phone photographs before storing them locally; no file leaves the device.
export async function localImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("请选择图片文件。");
  if (file.size > 25 * 1024 * 1024)
    throw new Error("这张图片有点大，请选择 25 MB 以内的图片。");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("暂时无法处理图片，请重试。");
    ctx.fillStyle = "#f2efe7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.78);
  } catch {
    throw new Error("无法读取这张图片，请尝试 JPG、PNG 或 WebP 图片。");
  } finally {
    URL.revokeObjectURL(url);
  }
}
