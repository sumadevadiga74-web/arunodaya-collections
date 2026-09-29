
"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const CONTACTS_QUERY = gql`
  query Contacts {
    contacts {
      id
      name
      email
      phone
      message
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CONTACT = gql`
  mutation CreateContact(
    $name: String!
    $email: String!
    $phone: String
    $message: String!
    $status: String
  ) {
    createContact(
      name: $name
      email: $email
      phone: $phone
      message: $message
      status: $status
    ) {
      id
      name
      email
      phone
      message
      status
    }
  }
`;

const UPDATE_CONTACT = gql`
  mutation UpdateContact(
    $id: ID!
    $name: String
    $email: String
    $phone: String
    $message: String
    $status: String
  ) {
    updateContact(
      id: $id
      name: $name
      email: $email
      phone: $phone
      message: $message
      status: $status
    ) {
      id
      name
      email
      phone
      message
      status
    }
  }
`;

const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id) {
      id
      name
    }
  }
`;

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status?: string;
};

export default function Contacts() {
  const { data, loading, error, refetch } = useQuery<{
    contacts: Contact[];
  }>(CONTACTS_QUERY);

  const [createContact] = useMutation(CREATE_CONTACT);
  const [updateContact] = useMutation(UPDATE_CONTACT);
  const [deleteContact] = useMutation(DELETE_CONTACT);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      alert("Name, email and message are required");
      return;
    }

    const variables = {
      name,
      email,
      phone: phone || undefined,
      message,
      status,
    };

    try {
      if (editingId) {
        await updateContact({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        alert("Contact updated successfully");
      } else {
        await createContact({
          variables,
        });

        alert("Contact created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setEmail(contact.email);
    setPhone(contact.phone || "");
    setMessage(contact.message);
    setStatus(contact.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      await deleteContact({
        variables: { id },
      });

      alert("Contact deleted successfully");
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading contacts...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading contacts: {error.message}
      </div>
    );
  }

  const contacts = data?.contacts ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>

        <p className="text-gray-500">
          Manage your Arunodaya Collections contacts
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Contact" : "Add Contact"}
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

        <textarea
          className="w-full rounded border p-2"
          placeholder="Message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
            {editingId ? "Update Contact" : "Add Contact"}
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

      {contacts.length === 0 ? (
        <div className="rounded border p-6 text-center text-gray-500">
          No contacts found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b">
                  <td className="p-4 font-medium">
                    {contact.name}
                  </td>

                  <td className="p-4">
                    {contact.email}
                  </td>

                  <td className="p-4">
                    {contact.phone || "-"}
                  </td>

                  <td className="p-4">
                    {contact.message}
                  </td>

                  <td className="p-4">
                    {contact.status || "active"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="rounded border px-3 py-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(contact.id)}
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

