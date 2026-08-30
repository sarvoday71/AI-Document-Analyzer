import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Fragment, type ReactNode, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
  return fileName.replace(/^\d+-\d{1,10}/, "");
}

function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong className="font-semibold text-slate-800" key={index}>{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

function SummaryMarkdown({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const headingClass = heading[1].length === 1
        ? "text-xl font-bold text-slate-900"
        : "text-base font-bold text-slate-900";
      blocks.push(<h3 className={headingClass} key={index}>{renderInlineMarkdown(heading[2])}</h3>);
      index += 1;
      continue;
    }

    const orderedItem = line.match(/^\d+\.\s+(.+)$/);
    const unorderedItem = line.match(/^[-*]\s+(.+)$/);
    if (orderedItem || unorderedItem) {
      const isOrdered = Boolean(orderedItem);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(isOrdered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      const List = isOrdered ? "ol" : "ul";
      blocks.push(
        <List className={`space-y-2 ${isOrdered ? "list-decimal" : "list-disc"} pl-5 marker:text-blue-600`} key={index}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInlineMarkdown(item)}</li>)}
        </List>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,3})\s+|^\d+\.\s+|^[-*]\s+/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={index}>{renderInlineMarkdown(paragraph.join(" "))}</p>);
  }

  return <div className="mt-4 space-y-5 text-sm leading-7 text-slate-600">{blocks}</div>;
}

function isBeingProcessed(status: DocumentStatus) {
  return status === "UPLOADED" || status === "PROCESSING";
}

function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: document, error, isError, isLoading } = useQuery({
    queryKey: ["document", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Document> => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You need to sign in to view this document.");
      }

      const response = await axios.get<Document>(
        `http://localhost:3000/document/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    },
    refetchInterval: (query) =>
      query.state.data && isBeingProcessed(query.state.data.status) ? 5000 : false,
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
      <div className="mx-auto max-w-4xl">
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
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            to="/document"
          >
            Back to documents
          </Link>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 sm:p-10">
          {isLoading && <p className="text-slate-600">Loading document...</p>}
          {isError && (
            <p className="text-sm text-red-600">
              {axios.isAxiosError(error) && error.response?.status === 404
                ? "This document could not be found."
                : "Unable to load this document. Please try again."}
            </p>
          )}

          {!isLoading && !isError && document && (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Document intelligence
                  </p>
                  <h1 className="mt-3 wrap-break-words text-3xl font-bold tracking-tight text-slate-900">
                    {getDisplayFileName(document.fileName)}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Uploaded {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[document.status]}`}
                >
                  {document.status.toLowerCase()}
                </span>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-8">
                <h2 className="text-lg font-semibold text-slate-900">
                  Full summary
                </h2>
                {document.summary ? (
                  <SummaryMarkdown content={document.summary} />
                ) : (
                  <p className="mt-3 text-sm text-slate-600">
                    A summary is not available yet. The document may still be
                    processing.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default DocumentDetail;
