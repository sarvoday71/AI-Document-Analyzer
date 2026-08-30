import axios from "axios";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

type DocumentStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

type Document = {
  id: number;
  fileName: string;
  status: DocumentStatus;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusStyles: Record<DocumentStatus, string> = {
  UPLOADED: "bg-slate-100 text-slate-700",
  PROCESSING: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

function getDisplayFileName(fileName: string) {
  // Uploads are stored as `${Date.now()}-${randomNumber}${originalName}`.
  // The random number can contain between 1 and 10 digits and is not followed
  // by an underscore, so remove that prefix directly.
  return fileName.replace(/^\d+-\d{1,10}/, "");
}

function isBeingProcessed(status: DocumentStatus) {
  return status === "UPLOADED" || status === "PROCESSING";
}

function Documents() {
  const navigate = useNavigate();
  const { data: documents = [], error, isError, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<Document[]> => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You need to sign in to view your documents.");
      }

      const response = await axios.get<Document[]>(
        "http://localhost:3000/document",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    refetchInterval: (query) =>
      query.state.data?.some((document) => isBeingProcessed(document.status))
        ? 5000
        : false,
    retry: false,
  });

  useEffect(() => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  }, [error, navigate]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              A
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              DocuMind
            </span>
          </div>
          <Link
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            to="/document/upload"
          >
            Upload document
          </Link>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Document intelligence
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Your documents
          </h1>
          <p className="mt-2 text-slate-600">
            Track uploaded documents and their analysis status.
          </p>

          {isLoading && (
            <p className="mt-8 text-slate-600">Loading documents…</p>
          )}
          {isError && (
            <p className="mt-8 text-sm text-red-600">
              Unable to load your documents. Please try again.
            </p>
          )}

          {!isLoading && !isError && documents.length === 0 && (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-800">No documents yet</p>
              <p className="mt-2 text-sm text-slate-600">
                Upload your first PDF, DOCX, or TXT file to get started.
              </p>
            </div>
          )}

          {!isLoading && !isError && documents.length > 0 && (
            <ul className="mt-8 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {documents.map((document) => (
                <li className="p-5" key={document.id}>
                  <Link
                    className="block rounded-lg transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    to={`/document/${document.id}`}
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-slate-900">
                        {getDisplayFileName(document.fileName)}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Uploaded{" "}
                        {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[document.status]}`}
                    >
                      {document.status.toLowerCase()}
                    </span>
                    </div>
                    {document.summary && (
                      <p className="mt-4 truncate text-sm leading-6 text-slate-600">
                        {document.summary}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default Documents;
