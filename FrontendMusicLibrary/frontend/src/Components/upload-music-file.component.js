import React, { useState } from "react";
import axios from "axios";
import MusicUploadForm from "./MusicUploadForm.js";

const UploadMusicFile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false); // Track upload progress
  const [error, setError] = useState(""); // Error message state
  const [successMessage, setSuccessMessage] = useState(""); // Success message state

  const onSubmit = async (musicObject, { resetForm }) => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true); // Show loading message
    setError(""); // Reset previous error
    setSuccessMessage(""); // Reset success message

    try {
      // Ensure the filename ends in .mp3
      const fileName = musicObject.name.endsWith(".mp3")
        ? musicObject.name
        : `${musicObject.name}.mp3`;

      // Step 1: Request a pre-signed URL from API Gateway
      const response = await axios.post(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_UPLOAD_ENDPOINT}`,
        {
          eventType: "upload",
          fileName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          validateStatus: (status) => status < 500, // Allow handling 409 error properly
        }
      );

      // ✅ Handle duplicate file error
      if (response.status === 409) {
        setError("A file with this name already exists. Please choose a different name.");
        setLoading(false);
        return;
      }

      const { downloadUrl } = response.data; // Extract the presigned URL

      // Step 2: Upload the file to S3
      await axios.put(downloadUrl, selectedFile, {
        headers: {
          "Content-Type": selectedFile.type || "audio/mpeg",
        },
        transformRequest: [(data) => data], // Ensures the file is uploaded correctly
      });

      setSuccessMessage("File successfully uploaded!  Vist the Music List page to listen to your songs"); // Show success message

      // ✅ Reset form fields **only** after successful upload
      setSelectedFile(null);
      resetForm(); // Reset form input fields
      document.getElementById("fileInput").value = ""; // Reset file input field
    } catch (err) {
      console.error("Upload error:", err);
      setError("Something went wrong: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false); // Hide loading message
    }
  };

  return (
    <div>
      {loading && <p>Uploading file... Please wait.</p>} {/* Show loading message during upload */}
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Show duplicate file error */}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>} {/* Show success message */}
      
      <MusicUploadForm
        initialValues={{ name: "", file: null }} // Ensure the initial file state is null
        onSubmit={onSubmit}
        onFileSelect={setSelectedFile}
        enableReinitialize
      />
    </div>
  );
};

export default UploadMusicFile;
