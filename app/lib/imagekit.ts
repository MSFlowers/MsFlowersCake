import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey:
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
    "public_ZxVApJt7DbRrZc9ofbuMgBRoSFY=",
  privateKey:
    process.env.IMAGEKIT_PRIVATE_KEY ||
    "private_6PjWeNe6CXGyhetxYjCOKKrPFFI=",
  urlEndpoint:
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
    "https://ik.imagekit.io/2zqgtm5bv",
});

export default imagekit;

export async function uploadImageToImageKit(
  fileBase64OrBuffer: string | Buffer,
  fileName: string,
  folder: string = "/categories"
): Promise<{ url: string; fileId: string; name: string }> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_6PjWeNe6CXGyhetxYjCOKKrPFFI=";
  const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");

  const formData = new FormData();
  if (Buffer.isBuffer(fileBase64OrBuffer)) {
    const blob = new Blob([new Uint8Array(fileBase64OrBuffer)]);
    formData.append("file", blob, fileName);
  } else {
    formData.append("file", fileBase64OrBuffer);
  }
  formData.append("fileName", fileName);
  formData.append("folder", folder);
  formData.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Direct ImageKit upload failed:", errorText);
    throw new Error(`ImageKit upload failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    url: data.url,
    fileId: data.fileId,
    name: data.name,
  };
}
