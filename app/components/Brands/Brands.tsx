"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

const BRANDS_QUERY = gql`
  query Brands {
    brands {
      id
      name
      description
      image
      status
    }
  }
`;

const CREATE_BRAND = gql`
  mutation CreateBrand(
    $name: String!
    $description: String
    $image: String
    $status: String
  ) {
    createBrand(
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

const UPDATE_BRAND = gql`
  mutation UpdateBrand(
    $id: ID!
    $name: String
    $description: String
    $image: String
    $status: String
  ) {
    updateBrand(
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

const DELETE_BRAND = gql`
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id) {
      id
    }
  }
`;

type Brand = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status?: string;
};

export default function Brands() {
  const { data, loading, error, refetch } = useQuery<{
    brands: Brand[];
  }>(BRANDS_QUERY);

  const [createBrand] = useMutation(CREATE_BRAND);
  const [updateBrand] = useMutation(UPDATE_BRAND);
  const [deleteBrand] = useMutation(DELETE_BRAND);

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
      alert("Brand name is required");
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
        await updateBrand({
          variables: {
            id: editingId,
            ...variables,
          },
        });
        alert("Brand updated successfully");
      } else {
        await createBrand({ variables });
        alert("Brand created successfully");
      }

      resetForm();
      await refetch();
    } catch (err) {
      alert("Operation failed");
      console.error(err);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setName(brand.name);
    setDescription(brand.description || "");
    setImage(brand.image || "");
    setStatus(brand.status || "active");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;

    try {
      await deleteBrand({
        variables: { id },
      });

      alert("Brand deleted successfully");
      await refetch();
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading brands...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading brands: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Brands</h1>

      <p className="mt-2 text-gray-600">
        Manage your Arunodaya Collections brands
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-lg border p-5 space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Brand" : "Add Brand"}
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Brand name"
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
            {editingId ? "Update Brand" : "Add Brand"}
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
        {data?.brands.length === 0 && (
          <p>No brands found.</p>
        )}

        {data?.brands.map((brand) => (
          <div
            key={brand.id}
            className="rounded-lg border p-5"
          >
            <h2 className="text-xl font-semibold">
              {brand.name}
            </h2>

            <p>{brand.description || "-"}</p>
            <p>Status: {brand.status}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(brand)}
                className="rounded border px-4 py-2"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(brand.id)}
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