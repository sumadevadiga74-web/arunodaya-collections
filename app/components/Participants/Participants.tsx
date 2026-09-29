
"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const PARTICIPANTS_QUERY = gql`
  query Participants {
    participants {
      id
      name
      email
      phone
      contestId
      status
    }
  }
`;

const CREATE_PARTICIPANT = gql`
  mutation CreateParticipant(
    $name: String!
    $email: String!
    $phone: String
    $contestId: String
    $status: String
  ) {
    createParticipant(
      name: $name
      email: $email
      phone: $phone
      contestId: $contestId
      status: $status
    ) {
      id
      name
      email
      phone
      contestId
      status
    }
  }
`;

const UPDATE_PARTICIPANT = gql`
  mutation UpdateParticipant(
    $id: ID!
    $name: String
    $email: String
    $phone: String
    $contestId: String
    $status: String
  ) {
    updateParticipant(
      id: $id
      name: $name
      email: $email
      phone: $phone
      contestId: $contestId
      status: $status
    ) {
      id
      name
      email
      phone
      contestId
      status
    }
  }
`;

const DELETE_PARTICIPANT = gql`
  mutation DeleteParticipant($id: ID!) {
    deleteParticipant(id: $id) {
      id
    }
  }
`;

type Participant = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  contestId?: string;
  status?: string;
};

export default function Participants() {
  const { data, loading, error, refetch } = useQuery<{
    participants: Participant[];
  }>(PARTICIPANTS_QUERY);

  const [createParticipant] = useMutation(CREATE_PARTICIPANT);
  const [updateParticipant] = useMutation(UPDATE_PARTICIPANT);
  const [deleteParticipant] = useMutation(DELETE_PARTICIPANT);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contestId, setContestId] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setContestId("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert("Name and email are required");
      return;
    }

    try {
      const variables = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        contestId: contestId.trim() || undefined,
        status,
      };

      if (editingId) {
        await updateParticipant({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        alert("Participant updated successfully");
      } else {
        await createParticipant({
          variables,
        });

        alert("Participant created successfully");
      }

      resetForm();
      await refetch();
    } catch (err: any) {
      console.error("Participant operation failed:", err);
      alert(
        err?.message
          ? `Operation failed: ${err.message}`
          : "Participant operation failed"
      );
    }
  };

  const handleEdit = (participant: Participant) => {
    setEditingId(participant.id);
    setName(participant.name);
    setEmail(participant.email);
    setPhone(participant.phone || "");
    setContestId(participant.contestId || "");
    setStatus(participant.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this participant?")) {
      return;
    }

    try {
      await deleteParticipant({
        variables: {
          id,
        },
      });

      alert("Participant deleted successfully");
      await refetch();
    } catch (err: any) {
      console.error("Delete participant failed:", err);
      alert(
        err?.message
          ? `Delete failed: ${err.message}`
          : "Delete failed"
      );
    }
  };

  if (loading) {
    return <div className="p-6">Loading participants...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading participants: {error.message}
      </div>
    );
  }

  const participants = data?.participants ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Participants</h1>

        <p className="text-gray-500">
          Manage your Arunodaya Collections participants
        </p>
      </div>

      {/* CREATE / UPDATE FORM */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Participant" : "Add Participant"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Contest ID"
          value={contestId}
          onChange={(e) => setContestId(e.target.value)}
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
            {editingId ? "Update Participant" : "Add Participant"}
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

      {/* PARTICIPANT LIST */}
      {participants.length === 0 ? (
        <div className="rounded border p-6 text-center text-gray-500">
          No participants found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Contest ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id} className="border-b">
                  <td className="p-4 font-medium">
                    {participant.name}
                  </td>

                  <td className="p-4">
                    {participant.email}
                  </td>

                  <td className="p-4">
                    {participant.phone || "-"}
                  </td>

                  <td className="p-4">
                    {participant.contestId || "-"}
                  </td>

                  <td className="p-4">
                    {participant.status || "active"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(participant)}
                        className="rounded border px-3 py-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(participant.id)
                        }
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

