"use client";

import { useState } from "react";
import Link from "next/link";
import { useHomeFeed } from "@/hooks/useHomeFeed";
import { searchQuestions, createRevisionPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types/api";

export default function HomePage() {
  const { posts, loading, error } = useHomeFeed();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Question[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newPlatform, setNewPlatform] = useState<
    "codeforces" | "leetcode" | "codechef" | "other"
  >("codeforces");
  const [note, setNote] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  type PlatformOption = "codeforces" | "leetcode" | "codechef" | "other";

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) return setResults([]);
    const response = await searchQuestions(value.trim());
    if (response.success && response.data) setResults(response.data);
  }

  async function postExisting(questionId: string) {
    setPosting(true);
    setPostError(null);
    try {
      await createRevisionPost({ questionId, note: note || undefined });
      window.location.reload();
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  async function postNew(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPosting(true);
    setPostError(null);
    try {
      await createRevisionPost({
        url: newUrl,
        platform: newPlatform,
        note: note || undefined,
      });
      window.location.reload();
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <div className="border border-border rounded-xl p-4 mb-6">
        <h2 className="text-sm font-semibold mb-2">
          Share a problem to revise
        </h2>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a problem..."
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background mb-2"
        />

        {results.length > 0 && (
          <div className="flex flex-col gap-1 mb-2">
            {results.map((q) => (
              <button
                key={q.id}
                onClick={() => postExisting(q.id)}
                disabled={posting}
                className="text-left text-sm px-3 py-2 rounded-lg hover:bg-muted"
              >
                {q.title}{" "}
                <span className="text-muted-foreground">({q.platform})</span>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm text-primary underline"
          >
            Not found — add it with a link
          </button>
        )}

        {showAddForm && (
          <form onSubmit={postNew} className="flex flex-col gap-2 mt-2">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Problem link"
              required
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
            />
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value as PlatformOption)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
            >
              <option value="codeforces">Codeforces</option>
              <option value="leetcode">LeetCode</option>
              <option value="codechef">CodeChef</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a quick note"
              rows={3}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background resize-none"
            />
            <Button type="submit" disabled={posting}>
              {posting ? "Posting..." : "Post"}
            </Button>
          </form>
        )}

        {postError && (
          <p className="text-sm text-destructive mt-2">{postError}</p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground text-center py-12">
          Loading feed...
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive text-center py-12">{error}</p>
      )}
      {!loading && posts.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          Nothing here yet — follow classmates to see their revision questions.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div key={post.id} className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/profile/${post.users.id}`}
                className="text-sm font-semibold hover:underline"
              >
                {post.users.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                shared a problem
              </span>
            </div>
            <a
              href={post.questions.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium text-primary hover:underline mb-1"
            >
              {post.questions.title}{" "}
              <span className="text-muted-foreground">
                ({post.questions.platform})
              </span>
            </a>
            {post.note && (
              <p className="text-sm text-muted-foreground">{post.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
