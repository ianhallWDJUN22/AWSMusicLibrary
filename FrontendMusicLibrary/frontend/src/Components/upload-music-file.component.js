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
      // Step 1: Request a pre-signed URL from the API Gateway
      const response = await axios.post(
        "https://msrii21sj5.execute-api.us-east-1.amazonaws.com/test-invoke-stage/uploadMusicResource.aws.com",
        JSON.stringify({
          eventType: "upload", // Must match what your Lambda function expects
          fileName: musicObject.name,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "YOUR_API_KEY",
          },
        }
      );

      const { uploadUrl } = response.data;

      // Step 2: Upload the file to S3 using the pre-signed URL
      await axios.put(uploadUrl, selectedFile, {
        headers: { "Content-Type": selectedFile.type },
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


// // src/Components/upload-music-file.component.js

// // UploadMusicFile Component for uploading new music
// // Import Modules
// import React,
// {
//     useState,
//     useEffect
// } from "react";
// import axios from 'axios';
// import MusicUploadForm
//     from "./MusicUploadForm.js";

// // UploadMusicFile Component
// const UploadMusicFile = () => {
//     const [formValues, setFormValues] =
//         useState(
//             {
//                 name: '',
//                 // File uploader : '', add these fields in when meta data is set up
//             })
//     // onSubmit handler
//     const onSubmit =
//         musicObject => {
//             axios.post(
// 'https://msrii21sj5.execute-api.us-east-1.amazonaws.com/test-invoke-stage/uploadMusicResource.aws.com',
//                 musicObject)
//                 .then(res => {
//                     if (res.status === 200)
//                         alert('File successfully uploaded')
//                     else
//                         Promise.reject()
//                 })
//                 .catch(err => alert('Something went wrong'))
//         }
//     // Return student form
//     return (
//         <MusicUploadForm initialValues={formValues}
//             onSubmit={onSubmit}
//             enableReinitialize>
//             Upload Music
//         </MusicUploadForm>
//     )
// }

// // Export UploadMusicFile Component
// export default UploadMusicFile
