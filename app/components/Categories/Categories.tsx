"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      description
      image
      status
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $name: String!
    $description: String
    $image: String
    $status: String
  ) {
    createCategory(
      name: $name
      description: $description
      image: $image
      status: $status
    ) {
      id
      name
      description
      image
      status
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $id: ID!
    $name: String
    $description: String
    $image: String
    $status: String
  ) {
    updateCategory(
      id: $id
      name: $name
      description: $description
      image: $image
      status: $status
    ) {
      id
      name
      description
      image
      status
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;

type Category = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status?: string;
};

export default function Categories() {
  const { data, loading, error, refetch } = useQuery<{
    categories: Category[];
  }>(CATEGORIES_QUERY);

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setImage("");
    setStatus("active");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert("Category name is required");
      return;
    }

    try {
      const variables = {
        name,
        description: description || undefined,
        image: image || undefined,
        status,
      };

      if (editingId) {
        await updateCategory({
          variables: {
            id: editingId,
            ...variables,
          },
        });
        alert("Category updated successfully");
      } else {
        await createCategory({ variables });
        alert("Category created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      alert("Operation failed");
      console.error(err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setImage(category.image || "");
    setStatus(category.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    try {
      await deleteCategory({
        variables: { id },
      });

      alert("Category deleted successfully");
      await refetch();
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading categories...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading categories: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Categories</h1>

      <p className="mt-2 text-gray-600">
        Manage your Arunodaya Collections categories
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-lg border p-5 space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Category" : "Add Category"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
            {editingId ? "Update Category" : "Add Category"}
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
        {data?.categories.length === 0 && (
          <p>No categories found.</p>
        )}

        {data?.categories.map((category) => (
          <div
            key={category.id}
            className="rounded-lg border p-5"
          >
            <h2 className="text-xl font-semibold">
              {category.name}
            </h2>

            <p>{category.description || "-"}</p>
            <p>Status: {category.status}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="rounded border px-4 py-2"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(category.id)}
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