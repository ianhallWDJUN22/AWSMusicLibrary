import React, { useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";

const MusicTableRow = ({ obj, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const { fileName, downloadUrl } = obj;

  const handlePlay = () => {
    window.open(downloadUrl, "_blank");
  };

  const handleEdit = () => {
    console.log(`Editing ${fileName}`);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_DELETE_ENDPOINT}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          params: { fileName },
        }
      );

      console.log("Delete Response:", response.data);

      if (onDelete) {
        onDelete(fileName);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Could not delete the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr>
      <td>{fileName}</td>
      <td>
        <Button variant="info" onClick={handlePlay} disabled={loading}>
          {loading ? "Loading..." : "Play"}
        </Button>
        <Button variant="warning" onClick={handleEdit} disabled={loading}>
          Edit
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={loading}>
          Delete
        </Button>
      </td>
    </tr>
  );
};

export default MusicTableRow;