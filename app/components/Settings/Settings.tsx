"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const SETTINGS_QUERY = gql`
  query Settings {
    settings {
      id
      siteName
      siteDescription
      logo
      email
      phone
      address
      status
    }
  }
`;

const CREATE_SETTINGS = gql`
  mutation CreateSettings(
    $siteName: String
    $siteDescription: String
    $logo: String
    $email: String
    $phone: String
    $address: String
    $status: String
  ) {
    createSettings(
      siteName: $siteName
      siteDescription: $siteDescription
      logo: $logo
      email: $email
      phone: $phone
      address: $address
      status: $status
    ) {
      id
      siteName
      siteDescription
      logo
      email
      phone
      address
      status
    }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdateSettings(
    $id: ID!
    $siteName: String
    $siteDescription: String
    $logo: String
    $email: String
    $phone: String
    $address: String
    $status: String
  ) {
    updateSettings(
      id: $id
      siteName: $siteName
      siteDescription: $siteDescription
      logo: $logo
      email: $email
      phone: $phone
      address: $address
      status: $status
    ) {
      id
      siteName
      siteDescription
      logo
      email
      phone
      address
      status
    }
  }
`;

const DELETE_SETTINGS = gql`
  mutation DeleteSettings($id: ID!) {
    deleteSettings(id: $id) {
      id
    }
  }
`;

type SettingsData = {
  settings: {
    id: string;
    siteName?: string;
    siteDescription?: string;
    logo?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: string;
  } | null;
};

export default function Settings() {
  const { data, loading, error, refetch } =
    useQuery<SettingsData>(SETTINGS_QUERY);

  const [createSettings] = useMutation<any>(CREATE_SETTINGS);
  const [updateSettings] = useMutation<any>(UPDATE_SETTINGS);
  const [deleteSettings] = useMutation<any>(DELETE_SETTINGS);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setSiteName("");
    setSiteDescription("");
    setLogo("");
    setEmail("");
    setPhone("");
    setAddress("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const variables = {
        siteName: siteName || undefined,
        siteDescription: siteDescription || undefined,
        logo: logo || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        status,
      };

      if (editingId) {
        await updateSettings({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        alert("Settings updated successfully");
      } else {
        await createSettings({
          variables,
        });

        alert("Settings created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleEdit = (settings: NonNullable<SettingsData["settings"]>) => {
    setEditingId(settings.id);
    setSiteName(settings.siteName || "");
    setSiteDescription(settings.siteDescription || "");
    setLogo(settings.logo || "");
    setEmail(settings.email || "");
    setPhone(settings.phone || "");
    setAddress(settings.address || "");
    setStatus(settings.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete these settings?")) {
      return;
    }

    try {
      await deleteSettings({
        variables: { id },
      });

      alert("Settings deleted successfully");
      resetForm();
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading settings: {error.message}
      </div>
    );
  }

  const settings = data?.settings;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <p className="text-gray-500">
          Manage your Arunodaya Collections settings
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Settings" : "Add Settings"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Site name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />

        <textarea
          className="w-full rounded border p-2"
          placeholder="Site description"
          value={siteDescription}
          onChange={(e) => setSiteDescription(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Logo"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
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
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
            {editingId ? "Update Settings" : "Add Settings"}
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

      {!settings ? (
        <div className="rounded border p-6 text-center text-gray-500">
          No settings found.
        </div>
      ) : (
        <div className="rounded border p-5">
          <h2 className="text-xl font-semibold">
            {settings.siteName || "-"}
          </h2>

          <p className="mt-2">
            Description: {settings.siteDescription || "-"}
          </p>

          <p>Email: {settings.email || "-"}</p>

          <p>Phone: {settings.phone || "-"}</p>

          <p>Address: {settings.address || "-"}</p>

          <p>Logo: {settings.logo || "-"}</p>

          <p>Status: {settings.status || "active"}</p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleEdit(settings)}
              className="rounded border px-3 py-1"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(settings.id)}
              className="rounded bg-red-600 px-3 py-1 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}