// src/Components/upload-music-file.component.js

// UploadMusicFile Component for uploading new music
// Import Modules
import React,
{
    useState,
    useEffect
} from "react";
import axios from 'axios';
import MusicUploadForm
    from "./MusicUploadForm.js";

// UploadMusicFile Component
const UploadMusicFile = () => {
    console.log("uploadMusicFile-1")
    const [formValues, setFormValues] =
        useState(
            {
                name: '',
                // File uploader : '', add these fields in when meta data is set up
            })
            console.log("uploadMusicFile-2")
    // onSubmit handler
    const onSubmit =
        musicObject => {
            axios.post(
'https://msrii21sj5.execute-api.us-east-1.amazonaws.com/test-invoke-stage/uploadMusicResource.aws.com',
                musicObject)
                .then(res => {
                    if (res.status === 200)
                        alert('File successfully uploaded')
                    else
                        Promise.reject()
                })
                .catch(err => alert('Something went wrong'))
        }
        console.log("uploadMusicFile-3")
    // Return student form
    return (
        <MusicUploadForm initialValues={formValues}
            onSubmit={onSubmit}
            enableReinitialize>
            Upload Music
        </MusicUploadForm>
    )
}

// Export UploadMusicFile Component
export default UploadMusicFile
