"use client";

import { useRef, useState } from "react";

type UploadFieldProps = {
  /** Form field name the uploaded URL is submitted under. */
  name: string;
  folder:
    | "safe-africa/projects"
    | "safe-africa/resources"
    | "safe-africa/gallery"
    | "safe-africa/team"
    | "safe-africa/general"
    | "safe-africa/cvs";
  label?: string;
  accept?: string;
  defaultUrl?: string;
  required?: boolean;
};

/**
 * Direct browser→Cloudinary upload. Fetches signed params from the app, posts
 * the file to Cloudinary, then exposes the resulting URL via a hidden input so
 * plain server-action forms can submit it. Degrades to a disabled state with a
 * hint when Cloudinary env keys are missing (the sign endpoint returns 503).
 */
export function UploadField({ name, folder, label, accept, defaultUrl, required }: UploadFieldProps) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "unconfigured">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setMessage("");
    try {
      const signResponse = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (signResponse.status === 503) {
        setStatus("unconfigured");
        setMessage("Uploads are not configured yet — add Cloudinary keys to .env.local.");
        return;
      }
      if (!signResponse.ok) throw new Error("Could not authorize the upload.");
      const sign = await signResponse.json();

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sign.apiKey);
      body.append("timestamp", String(sign.timestamp));
      body.append("signature", sign.signature);
      body.append("folder", sign.folder);
      // NOTE: Cloudinary blocks delivery of PDF/ZIP files by default (returns
      // 401), for BOTH image and raw resource types. To make CV links work,
      // enable "Allow delivery of PDF and ZIP files" in the Cloudinary console
      // (Settings → Security). This is an account setting, not a code toggle.
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
        { method: "POST", body }
      );
      if (!uploadResponse.ok) throw new Error("Upload failed.");
      const uploaded = await uploadResponse.json();
      setUrl(uploaded.secure_url);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return (
    <div className="space-y-1.5">
      {label && <span className="text-sm font-medium">{label}</span>}
      <input type="hidden" name={name} value={url} required={required} />
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        {status === "uploading" && <span className="text-sm text-muted-foreground">Uploading…</span>}
      </div>
      {url && (
        <p className="truncate text-xs text-muted-foreground">
          Uploaded:{" "}
          <a href={url} target="_blank" rel="noreferrer" className="underline">
            {url}
          </a>
        </p>
      )}
      {message && (
        <p className={`text-xs ${status === "unconfigured" ? "text-amber-600" : "text-destructive"}`}>{message}</p>
      )}
    </div>
  );
}
