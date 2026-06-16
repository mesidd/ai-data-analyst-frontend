"use client";

import { useState } from "react";
import {
  Search,
  Database,
  Code2,
  ShieldAlert,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type QueryRow = Record<string, any>;

export default function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [sql, setSql] = useState("");
  const [data, setData] = useState<QueryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setSql("");
    setData([]);

    try {
      const response = await fetch(
        `${API_URL}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to execute query"
        );
      }

      setSql(result.executed_sql);
      setData(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold">
              Air-Gapped AI Data Analyst
            </h1>
          </div>

          <p className="mt-2 text-slate-400">
            Enterprise deterministic SQL generation layer
          </p>
        </div>

        {/* Query Form */}
        <form
          onSubmit={handleQuery}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />

            <input
              type="text"
              value={prompt}
              onChange={(e) =>
                setPrompt(e.target.value)
              }
              placeholder="Ask a question about the clients database..."
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-4 pl-12 pr-36 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Run Query"
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-700 bg-red-950 p-4">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-semibold">
                Guardrail Triggered
              </span>
            </div>

            <p className="mt-2 text-red-200">
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && sql && (
          <div className="space-y-6">
            {/* SQL */}
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-green-400" />
                <h2 className="font-semibold">
                  Generated SQL
                </h2>
              </div>

              <pre className="overflow-x-auto rounded bg-slate-950 p-4 text-green-400">
                {sql}
              </pre>
            </div>

            {/* Data */}
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <h2 className="mb-4 font-semibold">
                Query Results
              </h2>

              {data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        {Object.keys(data[0]).map(
                          (key) => (
                            <th
                              key={key}
                              className="border-b border-slate-700 p-3 text-left"
                            >
                              {key.replace(
                                /_/g,
                                " "
                              )}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map(
                            (value, j) => (
                              <td
                                key={j}
                                className="border-b border-slate-800 p-3"
                              >
                                {value !== null
                                  ? String(value)
                                  : "N/A"}
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400">
                  No records found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
