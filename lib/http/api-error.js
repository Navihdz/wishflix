export async function readApiError(response, fallback = "Error de servidor") {
  try {
    const data = await response.json();
    if (data && typeof data.error === "string" && data.error.trim()) return data.error;
  } catch {
    // ignore and try plain text body
  }

  try {
    const text = await response.text();
    if (text && text.trim()) return text.trim();
  } catch {
    // ignore
  }

  return fallback;
}

