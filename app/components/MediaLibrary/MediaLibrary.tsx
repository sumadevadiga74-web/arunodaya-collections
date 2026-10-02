"use client";

import { useEffect, useState } from "react";


type MediaItem = {
  id: string;
  mediaType: string;
  url: string;
  publicId?: string;
  fullPublicId?: string;
  altText?: string;
  folder?: string;
  createdAt?: string;
};

type MediaLibraryProps = {
  selectedMedia?: MediaItem[];
  onSelect: (media: MediaItem) => void;
};

const GET_MEDIA = `
  query {
    media {
      id
      mediaType
      url
      publicId
      fullPublicId
      altText
      folder
      createdAt
    }
  }
`;

export default function MediaLibrary({
  selectedMedia = [],
  onSelect,
}: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL ||
          "http://localhost:4000/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: GET_MEDIA,
          }),
        }
      );

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to load media");
      }

      setMedia(result.data?.media || []);
    } catch (error) {
      console.error("MEDIA LOAD ERROR:", error);
      setError("Failed to load media.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(
          uploadResult.message || "Image upload failed."
        );
      }

      const createMediaMutation = `
        mutation CreateMedia(
          $mediaType: String!
          $url: String!
          $publicId: String
          $fullPublicId: String
          $altText: String
          $folder: String
        ) {
          createMedia(
            mediaType: $mediaType
            url: $url
            publicId: $publicId
            fullPublicId: $fullPublicId
            altText: $altText
            folder: $folder
          ) {
            id
            mediaType
            url
            publicId
            fullPublicId
            altText
            folder
            createdAt
          }
        }
      `;

      const mediaResponse = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL ||
          "http://localhost:4000/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: createMediaMutation,
            variables: {
              mediaType: uploadResult.mediaType || "image",
              url: uploadResult.imageUrl,
              publicId: uploadResult.publicId || "",
              fullPublicId: uploadResult.fullPublicId || "",
              altText: file.name,
              folder: "arunodaya/products",
            },
          }),
        }
      );

      const mediaResult = await mediaResponse.json();

      if (mediaResult.errors) {
        throw new Error(
          mediaResult.errors[0]?.message ||
            "Failed to save media."
        );
      }

      const newMedia = mediaResult.data?.createMedia;

      if (newMedia) {
        setMedia((previous) => [newMedia, ...previous]);
        onSelect(newMedia);
      }
    } catch (error) {
      console.error("MEDIA UPLOAD ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload image."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  const isSelected = (mediaItem: MediaItem) => {
    return selectedMedia.some(
      (item) => item.id === mediaItem.id
    );
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "12px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            Media Library
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              color: "#666",
              fontSize: "14px",
            }}
          >
            Upload and select product images.
          </p>
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#0B1F3A",
            color: "#fff",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {uploading ? "Uploading..." : "Upload Image"}

          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#fff1f1",
            color: "#c62828",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading media...</p>
      ) : media.length === 0 ? (
        <p
          style={{
            color: "#777",
            textAlign: "center",
            padding: "30px",
          }}
        >
          No media uploaded yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "15px",
          }}
        >
          {media.map((mediaItem) => (
            <button
              key={mediaItem.id}
              type="button"
              onClick={() => onSelect(mediaItem)}
              style={{
                position: "relative",
                padding: 0,
                border: isSelected(mediaItem)
                  ? "3px solid #C9A227"
                  : "1px solid #ddd",
                borderRadius: "10px",
                overflow: "hidden",
                background: "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <img
                src={mediaItem.url}
                alt={mediaItem.altText || "Media"}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  padding: "8px",
                  fontSize: "12px",
                  color: "#555",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {mediaItem.altText || "Image"}
              </div>

              {isSelected(mediaItem) && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#C9A227",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}