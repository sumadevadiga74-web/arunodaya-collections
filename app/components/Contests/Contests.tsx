
"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const CONTESTS_QUERY = gql`
  query Contests {
    contests {
      id
      title
      description
      image
      status
    }
  }
`;

const CREATE_CONTEST = gql`
  mutation CreateContest(
    $title: String!
    $description: String
    $image: String
    $status: String
  ) {
    createContest(
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

const UPDATE_CONTEST = gql`
  mutation UpdateContest(
    $id: ID!
    $title: String
    $description: String
    $image: String
    $status: String
  ) {
    updateContest(
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

const DELETE_CONTEST = gql`
  mutation DeleteContest($id: ID!) {
    deleteContest(id: $id) {
      id
    }
  }
`;

type Contest = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  status?: string;
};

export default function Contests() {
  const { data, loading, error, refetch } = useQuery<{
    contests: Contest[];
  }>(CONTESTS_QUERY);

  const [createContest] = useMutation(CREATE_CONTEST);
  const [updateContest] = useMutation(UPDATE_CONTEST);
  const [deleteContest] = useMutation(DELETE_CONTEST);

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

    if (!title.trim()) {
      alert("Contest title is required");
      return;
    }

    try {
      if (editingId) {
        await updateContest({
          variables: {
            id: editingId,
            title: title.trim(),
            description: description.trim() || undefined,
            image: image.trim() || undefined,
            status,
          },
        });

        alert("Contest updated successfully");
      } else {
        await createContest({
          variables: {
            title: title.trim(),
            description: description.trim() || undefined,
            image: image.trim() || undefined,
            status,
          },
        });

        alert("Contest created successfully");
      }

      resetForm();
      await refetch();
    } catch (err: any) {
      console.error("Contest operation failed:", err);
      alert(
        err?.message
          ? `Operation failed: ${err.message}`
          : "Contest operation failed"
      );
    }
  };

  const handleEdit = (contest: Contest) => {
    setEditingId(contest.id);
    setTitle(contest.title);
    setDescription(contest.description || "");
    setImage(contest.image || "");
    setStatus(contest.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contest?")) {
      return;
    }

    try {
      await deleteContest({
        variables: {
          id,
        },
      });

      alert("Contest deleted successfully");
      await refetch();
    } catch (err: any) {
      console.error("Delete contest failed:", err);
      alert(
        err?.message
          ? `Delete failed: ${err.message}`
          : "Delete failed"
      );
    }
  };

  if (loading) {
    return <div className="p-6">Loading contests...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading contests: {error.message}
      </div>
    );
  }

  const contests = data?.contests ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contests</h1>

        <p className="text-gray-500">
          Manage your Arunodaya Collections contests
        </p>
      </div>

      {/* CREATE / UPDATE FORM */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Contest" : "Add Contest"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Contest title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full rounded border p-2"
          placeholder="Description"
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
            {editingId ? "Update Contest" : "Add Contest"}
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

      {/* CONTEST LIST */}
      {contests.length === 0 ? (
        <div className="rounded border p-6 text-center text-gray-500">
          No contests found.
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
              {contests.map((contest) => (
                <tr key={contest.id} className="border-b">
                  <td className="p-4 font-medium">
                    {contest.title}
                  </td>

                  <td className="p-4">
                    {contest.description || "-"}
                  </td>

                  <td className="p-4">
                    {contest.image || "-"}
                  </td>

                  <td className="p-4">
                    {contest.status || "active"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(contest)}
                        className="rounded border px-3 py-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(contest.id)}
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

