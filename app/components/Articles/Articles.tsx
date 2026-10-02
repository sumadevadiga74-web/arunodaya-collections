
"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const ARTICLES_QUERY = gql`
  query Articles {
    articles {
      id
      title
      description
      image
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_ARTICLE = gql`
  mutation CreateArticle(
    $title: String!
    $description: String
    $image: String
    $status: String
  ) {
    createArticle(
      title: $title
      description: $description
      image: $image
      status: $status
    ) {
      id
      title
      description
      image
      status
    }
  }
`;

const UPDATE_ARTICLE = gql`
  mutation UpdateArticle(
    $id: ID!
    $title: String
    $description: String
    $image: String
    $status: String
  ) {
    updateArticle(
      id: $id
      title: $title
      description: $description
      image: $image
      status: $status
    ) {
      id
      title
      description
      image
      status
    }
  }
`;

const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: ID!) {
    deleteArticle(id: $id) {
      id
      title
    }
  }
`;

type Article = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Articles() {
  const { data, loading, error, refetch } = useQuery<{
    articles: Article[];
  }>(ARTICLES_QUERY);

  const [createArticle] = useMutation<any>(CREATE_ARTICLE);
  const [updateArticle] = useMutation<any>(UPDATE_ARTICLE);
  const [deleteArticle] = useMutation<any>(DELETE_ARTICLE);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImage("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert("Article title is required");
      return;
    }

    const variables = {
      title,
      description: description || undefined,
      image: image || undefined,
      status,
    };

    try {
      if (editingId) {
        await updateArticle({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        alert("Article updated successfully");
      } else {
        await createArticle({
          variables,
        });

        alert("Article created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setTitle(article.title);
    setDescription(article.description || "");
    setImage(article.image || "");
    setStatus(article.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      await deleteArticle({
        variables: { id },
      });

      alert("Article deleted successfully");
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading articles...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading articles: {error.message}
      </div>
    );
  }

  const articles = data?.articles ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>

        <p className="text-gray-500">
          Manage your Arunodaya Collections articles
        </p>
      </div>

      {/* CREATE / UPDATE FORM */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Article" : "Add Article"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full rounded border p-2"
          placeholder="Description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
            {editingId ? "Update Article" : "Add Article"}
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

      {/* ARTICLE LIST */}
      {articles.length === 0 ? (
        <div className="rounded border p-6 text-center text-gray-500">
          No articles found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Description</th>
                <th className="p-4">Image</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b">
                  <td className="p-4 font-medium">
                    {article.title}
                  </td>

                  <td className="p-4">
                    {article.description || "-"}
                  </td>

                  <td className="p-4">
                    {article.image || "-"}
                  </td>

                  <td className="p-4">
                    {article.status || "active"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="rounded border px-3 py-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(article.id)}
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

