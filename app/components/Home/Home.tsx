"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

const CREATE_HOME = gql`
  mutation CreateHome(
    $title: String!
    $description: String
    $image: String
    $status: String
  ) {
    createHome(
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

const UPDATE_HOME = gql`
  mutation UpdateHome(
    $id: ID!
    $title: String
    $description: String
    $image: String
    $status: String
  ) {
    updateHome(
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

const DELETE_HOME = gql`
  mutation DeleteHome($id: ID!) {
    deleteHome(id: $id) {
      id
    }
  }
`;

type HomeData = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  status?: string;
};

type HomeProps = {
  initialHome: HomeData | null;
};

export default function HomeComponent({
  initialHome,
}: HomeProps) {
  const [home, setHome] = useState<HomeData | null>(
    initialHome
  );

  const [createHome] = useMutation(CREATE_HOME);
  const [updateHome] = useMutation(UPDATE_HOME);
  const [deleteHome] = useMutation(DELETE_HOME);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImage("");
    setStatus("active");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setSaving(true);

    const variables = {
      title: title.trim(),
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      status,
    };

    try {
      if (editingId) {
        const result = await updateHome({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        if (result.data?.updateHome) {
          setHome(result.data.updateHome);
        }

        alert("Home updated successfully");
      } else {
        const result = await createHome({
          variables,
        });

        if (result.data?.createHome) {
          setHome(result.data.createHome);
        }

        alert("Home created successfully");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: HomeData) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setImage(item.image || "");
    setStatus(item.status || "active");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this home content?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await deleteHome({
        variables: {
          id,
        },
      });

      setHome(null);
      resetForm();

      alert("Home deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Home
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your Arunodaya Collections home content
          </p>
        </div>

        {/* Form */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? "Edit Home" : "Add Home"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingId
                ? "Update your existing home content."
                : "Add a new home content entry."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                placeholder="Enter home title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                placeholder="Enter home description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image
              </label>

              <input
                type="text"
                placeholder="Enter image URL"
                value={image}
                onChange={(e) =>
                  setImage(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="active">Active</option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Home"
                  : "Add Home"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Home Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Home Content
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current home content from the database
              </p>
            </div>

            {home && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  home.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {home.status || "active"}
              </span>
            )}
          </div>

          {!home ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
              <h3 className="text-lg font-medium text-gray-800">
                No home content found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Add home content using the form above.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Image */}
                {home.image && (
                  <div className="w-full md:w-64">
                    <img
                      src={home.image}
                      alt={home.title}
                      className="h-48 w-full rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {home.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {home.description || "-"}
                  </p>

                  <div className="mt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      ID
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-600">
                      {home.id}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(home)
                      }
                      disabled={deleting}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(home.id)
                      }
                      disabled={deleting}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}