
"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      email
      phone
      role
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser(
    $name: String!
    $email: String!
    $phone: String
    $status: String
  ) {
    createUser(
      name: $name
      email: $email
      phone: $phone
      status: $status
    ) {
      id
      name
      email
      phone
      role
      status
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $name: String
    $email: String
    $phone: String
    $status: String
  ) {
    updateUser(
      id: $id
      name: $name
      email: $email
      phone: $phone
      status: $status
    ) {
      id
      name
      email
      phone
      role
      status
      createdAt
      updatedAt
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      name
    }
  }
`;

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Users() {
  const { data, loading, error, refetch } = useQuery<{
    users: User[];
  }>(USERS_QUERY);

  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert("Name and email are required");
      return;
    }

    const variables = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      status,
    };

    try {
      if (editingId) {
        await updateUser({
          variables: {
            id: editingId,
            ...variables,
          },
        });

        alert("User updated successfully");
      } else {
        await createUser({
          variables,
        });

        alert("User created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setStatus(user.status || "active");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser({
        variables: { id },
      });

      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }

      alert("User deleted successfully");
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleStatusChange = async (
    user: User,
    newStatus: string
  ) => {
    if (user.status === newStatus) {
      return;
    }

    try {
      await updateUser({
        variables: {
          id: user.id,
          status: newStatus,
        },
      });

      setSelectedUser((current) =>
        current
          ? {
              ...current,
              status: newStatus,
            }
          : null
      );

      await refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to update user status");
    }
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (userStatus?: string) => {
    switch ((userStatus || "active").toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";

      case "inactive":
        return "bg-gray-100 text-gray-600";

      case "blocked":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            Loading users...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
            Error loading users: {error.message}
          </div>
        </div>
      </main>
    );
  }

  const users = data?.users ?? [];

  const activeUsers = users.filter(
    (user) => (user.status || "active").toLowerCase() === "active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => (user.status || "active").toLowerCase() === "inactive"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Users
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your Arunodaya Collections users
          </p>
        </div>

        {/* SUMMARY */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {users.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Users
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeUsers}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Inactive Users
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-600">
              {inactiveUsers}
            </p>
          </div>

        </div>

        {/* CREATE / UPDATE FORM */}

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? "Edit User" : "Add User"}
            </h2>

            <p className="text-sm text-gray-500">
              {editingId
                ? "Update customer information"
                : "Create a new customer account"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
                placeholder="Customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
                placeholder="Customer email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>

              <input
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="flex gap-2 md:col-span-2">

              <button
                type="submit"
                className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
              >
                {editingId ? "Update User" : "Add User"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* USER LIST */}

        <section className="rounded-xl bg-white shadow-sm">

          <div className="border-b p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Customer List
            </h2>

            <p className="text-sm text-gray-500">
              View and manage registered customers
            </p>
          </div>

          {users.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      <td className="p-4 font-medium text-gray-900">
                        {user.name}
                      </td>

                      <td className="p-4 text-gray-700">
                        {user.email}
                      </td>

                      <td className="p-4 text-gray-700">
                        {user.phone || "-"}
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={user.status || "active"}
                          onChange={(e) =>
                            handleStatusChange(
                              user,
                              e.target.value
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1 text-xs font-semibold outline-none ${getStatusClass(
                            user.status
                          )}`}
                        >
                          <option value="active">
                            Active
                          </option>

                          <option value="inactive">
                            Inactive
                          </option>
                        </select>
                      </td>

                      <td className="p-4 text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="p-4">

                        <div className="flex flex-wrap gap-2">

                          <button
                            onClick={() =>
                              setSelectedUser(user)
                            }
                            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                          >
                            Details
                          </button>

                          <button
                            onClick={() =>
                              handleEdit(user)
                            }
                            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(user.id)
                            }
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
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

        </section>

        {/* USER DETAILS MODAL */}

        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between border-b p-6">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    User Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Customer account information
                  </p>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-2xl text-gray-400 hover:text-gray-900"
                  aria-label="Close"
                >
                  ×
                </button>

              </div>

              {/* USER PROFILE */}

              <div className="p-6">

                <div className="mb-6 flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
                    {selectedUser.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUser.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {selectedUser.email}
                    </p>
                  </div>

                </div>

                {/* DETAILS */}

                <div className="space-y-4">

                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-gray-500">
                      User ID
                    </p>

                    <p className="mt-1 break-all font-medium">
                      {selectedUser.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-gray-500">
                        Name
                      </p>

                      <p className="mt-1 font-medium">
                        {selectedUser.name}
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-gray-500">
                        Role
                      </p>

                      <p className="mt-1 font-medium capitalize">
                        {selectedUser.role}
                      </p>
                    </div>

                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-all font-medium">
                      {selectedUser.email}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-gray-500">
                      Phone
                    </p>

                    <p className="mt-1 font-medium">
                      {selectedUser.phone || "-"}
                    </p>
                  </div>

                  {/* STATUS MANAGEMENT */}

                  <div className="rounded-lg border p-4">

                    <p className="text-sm font-semibold text-gray-900">
                      Status Management
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Change the customer's account status.
                    </p>

                    <select
                      value={
                        selectedUser.status || "active"
                      }
                      onChange={(e) =>
                        handleStatusChange(
                          selectedUser,
                          e.target.value
                        )
                      }
                      className="mt-3 w-full rounded-lg border p-3"
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>

                    <div className="mt-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          selectedUser.status
                        )}`}
                      >
                        {(
                          selectedUser.status ||
                          "active"
                        ).toUpperCase()}
                      </span>
                    </div>

                  </div>

                  {/* DATES */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-gray-500">
                        Created
                      </p>

                      <p className="mt-1 font-medium">
                        {formatDate(
                          selectedUser.createdAt
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-gray-500">
                        Last Updated
                      </p>

                      <p className="mt-1 font-medium">
                        {formatDate(
                          selectedUser.updatedAt
                        )}
                      </p>
                    </div>

                  </div>

                </div>

                {/* MODAL ACTIONS */}

                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-5">

                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      handleEdit(selectedUser);
                    }}
                    className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
                  >
                    Edit User
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(selectedUser.id)
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                  >
                    Delete User
                  </button>

                  <button
                    onClick={() =>
                      setSelectedUser(null)
                    }
                    className="rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-800"
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}

