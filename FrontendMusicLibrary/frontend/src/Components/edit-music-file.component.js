import React,
{
    useState,
    useEffect
} from "react";
import axios from "axios";
import MusicUploadForm from "./MusicUploadForm";

// EditMusicFile Component
const EditMusicFile = (props) => {
    const [formValues, setFormValues] =
        useState(
            {
                name: "",
            }
        );

    //onSubmit handler
    const onSubmit = (musicObject) => {
        axios
            .put(
"https://msrii21sj5.execute-api.us-east-1.amazonaws.com/test-invoke-stage/uploadMusicResource" +
                props.match.params.id,
                musicObject
            )
            .then((res) => {
                if (res.status === 200) {
                    alert("File successfully updated");
                    props.history.push("/music-list");
                } else Promise.reject();
            })
            .catch(
                (err) =>
                    alert("Something went wrong")
            );
    };

    // Load data from server and reinitialize music upload form
    useEffect(() => {
        axios
            .get(
"https://msrii21sj5.execute-api.us-east-1.amazonaws.com/test-invoke-stage/uploadMusicResource"
                + props.match.params.id
            )
            .then((res) => {
                const {
                    name,
                } = res.data;
                setFormValues(
                    {
                        name,
                    });
            })
            .catch(
                (err) =>
                    console.log(err)
            );
    }, []);

    // Return music upload form
    return (
        <MusicUploadForm
            initialValues={formValues}
            onSubmit={onSubmit}
            enableReinitialize>
            Update Music
        </MusicUploadForm>
    );
};

// Export EditMusicFile Component
export default EditMusicFile;
