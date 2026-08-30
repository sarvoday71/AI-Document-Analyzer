import { useRef, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

function DocumentUpload() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function selectFile(selectedFile: File | null) {
    setError("");
    setSuccess("");

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Choose a PDF, DOCX, or TXT file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("The file must be smaller than 10 MB.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError("Choose a document before uploading.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please sign in before uploading a document.");
      navigate("/login");
      return;
    }

    setError("");
    setSuccess("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      console.log("Formdata before appending file", formData);
      formData.append("document", file);
      console.log("Formdata After appending file", formData);

      await axios.post("http://localhost:3000/document/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });

      setSuccess("Document uploaded. Analysis will begin shortly.");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(
          Array.isArray(message)
            ? message.join(", ")
            : (message ?? "Unable to upload the document."),
        );
      } else {
        setError("Something went wrong while uploading the document.");
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            A
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            DocuMind
          </span>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Document intelligence
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Upload a document
          </h1>
          <p className="mt-2 text-slate-600">
            Upload a PDF, DOCX, or TXT file to begin analyzing it.
          </p>

          <input
            ref={inputRef}
            accept=".pdf,.docx,.txt"
            className="sr-only"
            id="document"
            onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
            type="file"
          />
          <label
            className="mt-8 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center transition hover:border-blue-500 hover:bg-blue-50"
            htmlFor="document"
          >
            <span className="grid size-12 place-items-center rounded-full bg-blue-100 text-2xl text-blue-700">
              ↑
            </span>
            <span className="mt-4 font-semibold text-slate-800">
              {file ? file.name : "Choose a document"}
            </span>
            <span className="mt-2 text-sm text-slate-500">
              PDF, DOCX, or TXT · Maximum 10 MB
            </span>
          </label>

          {file && (
            <p className="mt-3 text-sm text-slate-600">
              Selected file: {file.name}
            </p>
          )}
          {error && <p className="mt-5 text-sm text-red-600">{error}</p>}
          {success && (
            <p className="mt-5 text-sm text-emerald-700">{success}</p>
          )}

          <button
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!file || isUploading}
            onClick={handleUpload}
            type="button"
          >
            {isUploading ? "Uploading..." : "Upload document"}
          </button>
        </section>
      </div>
    </main>
  );
}

export default DocumentUpload;
