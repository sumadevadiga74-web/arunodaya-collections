"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const COLOURS_QUERY = gql`
  query Colours {
    colours {
      id
      name
      code
      status
    }
  }
`;

const CREATE_COLOUR = gql`
  mutation CreateColour(
    $name: String!
    $code: String
    $status: String
  ) {
    createColour(
      name: $name
      code: $code
      status: $status
    ) {
      id
      name
      code
      status
    }
  }
`;

const UPDATE_COLOUR = gql`
  mutation UpdateColour(
    $id: ID!
    $name: String
    $code: String
    $status: String
  ) {
    updateColour(
      id: $id
      name: $name
      code: $code
      status: $status
    ) {
      id
      name
      code
      status
    }
  }
`;

const DELETE_COLOUR = gql`
  mutation DeleteColour($id: ID!) {
    deleteColour(id: $id) {
      id
    }
  }
`;

type Colour = {
  id: string;
  name: string;
  code?: string;
  status?: string;
};

export default function Colours() {
  const { data, loading, error, refetch } = useQuery<{
    colours: Colour[];
  }>(COLOURS_QUERY);

  const [createColour] = useMutation(CREATE_COLOUR);
  const [updateColour] = useMutation(UPDATE_COLOUR);
  const [deleteColour] = useMutation(DELETE_COLOUR);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert("Colour name is required");
      return;
    }

    try {
      const variables = {
        name,
        code: code || undefined,
        status,
      };

      if (editingId) {
        await updateColour({
          variables: {
            id: editingId,
            ...variables,
          },
        });
        alert("Colour updated successfully");
      } else {
        await createColour({ variables });
        alert("Colour created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      alert("Operation failed");
      console.error(err);
    }
  };

  const handleEdit = (colour: Colour) => {
    setEditingId(colour.id);
    setName(colour.name);
    setCode(colour.code || "");
    setStatus(colour.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this colour?")) return;

    try {
      await deleteColour({
        variables: { id },
      });

      alert("Colour deleted successfully");
      await refetch();
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading colours...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading colours: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Colours</h1>

      <p className="mt-2 text-gray-600">
        Manage your Arunodaya Collections colours
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-lg border p-5 space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Colour" : "Add Colour"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Colour name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Colour code e.g. #FF0000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
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
            {editingId ? "Update Colour" : "Add Colour"}
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
        {data?.colours.length === 0 && (
          <p>No colours found.</p>
        )}

        {data?.colours.map((colour) => (
          <div
            key={colour.id}
            className="rounded-lg border p-5"
          >
            <h2 className="text-xl font-semibold">
              {colour.name}
            </h2>

            <p>Code: {colour.code || "-"}</p>
            <p>Status: {colour.status}</p>

            <div className="mt-4 flex gap-2">
             <button
  type="button"
  onClick={() => handleEdit(colour)}
  className="rounded border px-4 py-2"
>
  Edit
</button>
<button
  type="button"
  onClick={() => handleDelete(colour.id)}
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