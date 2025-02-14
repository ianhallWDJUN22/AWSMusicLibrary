import React, { useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";

const MusicTableRow = ({ obj, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const { fileName, downloadUrl } = obj;

  // Handle "Play" button: Opens file in a new tab
  const handlePlay = () => {
    window.open(downloadUrl, "_blank");
  };

  // Handle "Edit" button: Placeholder for future edit functionality
  const handleEdit = () => {
    console.log(`Editing ${fileName}`);
  };

  // Handle "Delete" button: Calls DELETE Lambda via API Gateway
  const handleDelete = async () => {
    // Show confirmation prompt before proceeding
    const userConfirmed = window.confirm(
      `You are about to delete "${fileName}". Are you sure you want to continue?`
    );

    if (!userConfirmed) {
      return; // Exit function if user cancels
    }

    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_DELETE_ENDPOINT}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          params: { fileName }, // Passes fileName as a query parameter to the API
        }
      );

      console.log("Delete Response:", response.data);

      // Trigger parent component's onDelete callback if provided
      if (onDelete) {
        onDelete(fileName);
      }
    } catch (err) {
      console.error("Error deleting file:", err);

      // Check if the error is a CORS issue (optional)
      if (err.response) {
        console.error("Response Error Data:", err.response.data);
      }

      alert("Could not delete the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr>
      <td className='table-row-play-button'>
       <div className='play-button-wrapper'>
        <Button
          className='play-button action-button'
          variant='info'
          onClick={handlePlay}
          disabled={loading}
        >
          {loading ? "Loading..." : "Play"}
        </Button>
       </div>
      </td>
      <td>
        <div className='list-table-left'>
          <div className='list-name-wrapper'>
            <div className='list-file-name'>{fileName}</div>
          </div>
        </div>
      </td>

      <td>
        <div className='action-button-group'>
          <Button
            className='edit-button action-button'
            variant='warning'
            onClick={handleEdit}
            disabled={loading}
          >
            Edit
          </Button>
          <Button
            className='delete-button action-button'
            variant='danger'
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default MusicTableRow;
