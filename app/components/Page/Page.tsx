"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const PAGES_QUERY = gql`
  query Pages {
    pages {
      id
      title
      slug
      content
      image
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_PAGE = gql`
  mutation CreatePage(
    $title: String!
    $slug: String!
    $content: String
    $image: String
    $status: String
  ) {
    createPage(
      title: $title
      slug: $slug
      content: $content
      image: $image
      status: $status
    ) {
      id
      title
      slug
      content
      image
      status
    }
  }
`;

const UPDATE_PAGE = gql`
  mutation UpdatePage(
    $id: ID!
    $title: String
    $slug: String
    $content: String
    $image: String
    $status: String
  ) {
    updatePage(
      id: $id
      title: $title
      slug: $slug
      content: $content
      image: $image
      status: $status
    ) {
      id
      title
      slug
      content
      image
      status
    }
  }
`;

const DELETE_PAGE = gql`
  mutation DeletePage($id: ID!) {
    deletePage(id: $id) {
      id
    }
  }
`;

type PageItem = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  image?: string;
  status?: string;
};

export default function Page() {
  const { data, loading, error, refetch } = useQuery<{
    pages: PageItem[];
  }>(PAGES_QUERY);

  const [createPage] = useMutation<any>(CREATE_PAGE);
  const [updatePage] = useMutation<any>(UPDATE_PAGE);
  const [deletePage] = useMutation<any>(DELETE_PAGE);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setImage("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug) {
      alert("Title and slug are required");
      return;
    }

    try {
      const variables = {
        title,
        slug,
        content: content || undefined,
        image: image || undefined,
        status,
      };

      if (editingId) {
        await updatePage({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        alert("Page updated successfully");
      } else {
        await createPage({
          variables,
        });

        alert("Page created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleEdit = (page: PageItem) => {
    setEditingId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content || "");
    setImage(page.image || "");
    setStatus(page.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }

    try {
      await deletePage({
        variables: { id },
      });

      alert("Page deleted successfully");
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading pages...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading pages: {error.message}
      </div>
    );
  }

  const pages = data?.pages ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>

        <p className="text-gray-500">
          Manage your Arunodaya Collections pages
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Page" : "Add Page"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Page title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <textarea
          className="w-full rounded border p-2"
          placeholder="Content"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <select
          className="w-full rounded border p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            {editingId ? "Update Page" : "Add Page"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {pages.length === 0 ? (
        <div className="rounded border p-6 text-center text-gray-500">
          No pages found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Content</th>
                <th className="p-4">Image</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b">
                  <td className="p-4 font-medium">
                    {page.title}
                  </td>

                  <td className="p-4">
                    {page.slug}
                  </td>

                  <td className="p-4">
                    {page.content || "-"}
                  </td>

                  <td className="p-4">
                    {page.image || "-"}
                  </td>

                  <td className="p-4">
                    {page.status || "active"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(page)}
                        className="rounded border px-3 py-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(page.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}