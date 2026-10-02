"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const SIZES_QUERY = gql`
  query Sizes {
    sizes {
      id
      name
      status
    }
  }
`;

const CREATE_SIZE = gql`
  mutation CreateSize(
    $name: String!
    $status: String
  ) {
    createSize(
      name: $name
      status: $status
    ) {
      id
      name
      status
    }
  }
`;

const UPDATE_SIZE = gql`
  mutation UpdateSize(
    $id: ID!
    $name: String
    $status: String
  ) {
    updateSize(
      id: $id
      name: $name
      status: $status
    ) {
      id
      name
      status
    }
  }
`;

const DELETE_SIZE = gql`
  mutation DeleteSize($id: ID!) {
    deleteSize(id: $id) {
      id
    }
  }
`;

type Size = {
  id: string;
  name: string;
  status?: string;
};

export default function Sizes() {
  const { data, loading, error, refetch } = useQuery<{
    sizes: Size[];
  }>(SIZES_QUERY);

  const [createSize] = useMutation<any>(CREATE_SIZE);
  const [updateSize] = useMutation<any>(UPDATE_SIZE);
  const [deleteSize] = useMutation<any>(DELETE_SIZE);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert("Size name is required");
      return;
    }

    try {
      const variables = {
        name,
        status,
      };

      if (editingId) {
        await updateSize({
          variables: {
            id: editingId,
            ...variables,
          },
        });
        alert("Size updated successfully");
      } else {
        await createSize({ variables });
        alert("Size created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      alert("Operation failed");
      console.error(err);
    }
  };

  const handleEdit = (size: Size) => {
    setEditingId(size.id);
    setName(size.name);
    setStatus(size.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this size?")) return;

    try {
      await deleteSize({
        variables: { id },
      });

      alert("Size deleted successfully");
      await refetch();
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading sizes...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading sizes: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Sizes</h1>

      <p className="mt-2 text-gray-600">
        Manage your Arunodaya Collections sizes
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-lg border p-5 space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Size" : "Add Size"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Size name e.g. S, M, L, XL"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
            {editingId ? "Update Size" : "Add Size"}
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

      <div className="mt-8 space-y-4">
        {data?.sizes.length === 0 && (
          <p>No sizes found.</p>
        )}

        {data?.sizes.map((size) => (
          <div
            key={size.id}
            className="rounded-lg border p-5"
          >
            <h2 className="text-xl font-semibold">
              {size.name}
            </h2>

            <p>Status: {size.status}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(size)}
                className="rounded border px-4 py-2"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(size.id)}
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}