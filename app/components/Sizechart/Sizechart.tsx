"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const SIZECHARTS_QUERY = gql`
  query Sizecharts {
    getSizecharts {
      id
      name
      slug
      image
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SIZECHART = gql`
  mutation CreateSizechart($input: SizechartInput!) {
    createSizechart(input: $input) {
      success
      message
      data {
        id
        name
        slug
        image
        status
      }
    }
  }
`;

const UPDATE_SIZECHART = gql`
  mutation UpdateSizechart($input: SizechartInput!) {
    updateSizechart(input: $input) {
      success
      message
      data {
        id
        name
        slug
        image
        status
      }
    }
  }
`;

const DELETE_SIZECHART = gql`
  mutation DeleteSizechart($id: ID!) {
    deleteSizechart(id: $id) {
      success
      message
      data {
        id
      }
    }
  }
`;

type Sizechart = {
  id: string;
  name?: string;
  slug?: string;
  image?: string;
  status?: string;
};

export default function Sizechart() {
  const { data, loading, error, refetch } = useQuery<{
    getSizecharts: Sizechart[];
  }>(SIZECHARTS_QUERY);

  const [createSizechart] = useMutation(CREATE_SIZECHART);
  const [updateSizechart] = useMutation(UPDATE_SIZECHART);
  const [deleteSizechart] = useMutation(DELETE_SIZECHART);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setImage("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert("Sizechart name is required");
      return;
    }

    try {
      if (editingId) {
        await updateSizechart({
          variables: {
            input: {
              id: editingId,
              name,
              slug: slug || undefined,
              image: image || undefined,
              status,
            },
          },
        });

        alert("Sizechart updated successfully");
      } else {
        await createSizechart({
          variables: {
            input: {
              name,
              slug: slug || undefined,
              image: image || undefined,
              status,
            },
          },
        });

        alert("Sizechart created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleEdit = (sizechart: Sizechart) => {
    setEditingId(sizechart.id);
    setName(sizechart.name || "");
    setSlug(sizechart.slug || "");
    setImage(sizechart.image || "");
    setStatus(sizechart.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sizechart?")) {
      return;
    }

    try {
      await deleteSizechart({
        variables: { id },
      });

      alert("Sizechart deleted successfully");
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading sizecharts...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading sizecharts: {error.message}
      </div>
    );
  }

  const sizecharts = data?.getSizecharts ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sizechart</h1>

        <p className="text-gray-500">
          Manage your Arunodaya Collections sizecharts
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Sizechart" : "Add Sizechart"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Sizechart name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
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
            {editingId ? "Update Sizechart" : "Add Sizechart"}
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

      {sizecharts.length === 0 ? (
        <div className="rounded border p-6 text-center text-gray-500">
          No sizecharts found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Image</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sizecharts.map((sizechart) => (
                <tr key={sizechart.id} className="border-b">
                  <td className="p-4 font-medium">
                    {sizechart.name || "-"}
                  </td>

                  <td className="p-4">
                    {sizechart.slug || "-"}
                  </td>

                  <td className="p-4">
                    {sizechart.image || "-"}
                  </td>

                  <td className="p-4">
                    {sizechart.status || "active"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(sizechart)}
                        className="rounded border px-3 py-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(sizechart.id)}
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