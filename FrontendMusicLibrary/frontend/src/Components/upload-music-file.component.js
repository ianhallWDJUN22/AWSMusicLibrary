import React, { useState } from "react";
import axios from "axios";
import MusicUploadForm from "./MusicUploadForm.js";

const UploadMusicFile = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onSubmit = async (musicObject) => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
  
    try {
      // ✅ Ensure the filename ends in .mp3
      const fileName = musicObject.name.endsWith(".mp3") ? musicObject.name : `${musicObject.name}.mp3`;
  
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
        }
      );
  
      const { downloadUrl } = response.data; // Changed this from 'uploadUrl' to 'downloadUrl'
  
      // Step 2: Upload the file to S3
      await axios.put(downloadUrl, selectedFile, {
        headers: { 
          "Content-Type": selectedFile.type || "audio/mpeg",
        },
        transformRequest: [(data) => data], // ✅ Prevents Axios from encoding the file
      });
  
      alert("File successfully uploaded");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong: " + err.message);
    }
  };

  return (
    <MusicUploadForm
      initialValues={{ name: "" }}
      onSubmit={onSubmit}
      onFileSelect={setSelectedFile}
      enableReinitialize
    >
      Upload Music
    </MusicUploadForm>
  );
};

export default UploadMusicFile;