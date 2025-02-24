import React, { useState } from "react";
import { Button, FormControl } from "react-bootstrap";
import axios from "axios";

const MusicTableRow = ({ obj, onDelete, onRename }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newFileName, setNewFileName] = useState(obj.fileName);
  const [error, setError] = useState("");

  const { fileName, downloadUrl } = obj;

  const handlePlay = () => {
    window.open(downloadUrl, "_blank");
  };

  // Enables the editing mode
  const handleEdit = () => {
    setIsEditing(true);
    setError(""); // Clear any previous errors
  };

  // Cancels editing and resets the file name
  const handleCancel = () => {
    setIsEditing(false);
    setNewFileName(fileName);
    setError("");
  };

  // Handles renaming logic
  const handleRename = async () => {
    let formattedFileName = newFileName.trim();

    if (!formattedFileName) {
      setError("File name cannot be empty.");
      return;
    }

    // Append .mp3 if it’s not already included
    if (!formattedFileName.toLowerCase().endsWith(".mp3")) {
      formattedFileName += ".mp3";
    }

    if (formattedFileName === fileName) {
      handleCancel();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_EDIT_ENDPOINT}`,
        {
          oldFileName: fileName,
          newFileName: formattedFileName,
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 409) {
        setError("A file with this name already exists. Choose a different name.");
      } else {
        console.log("Rename Response:", response.data);
        if (onRename) {
          onRename(fileName, formattedFileName);
        }
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error renaming file:", err);
      alert("Could not rename the file.");
    } finally {
      setLoading(false);
    }
  };

  // Handles deletion confirmation and API request
  const handleDelete = async () => {
    const userConfirmed = window.confirm(
      `You are about to delete "${fileName}". Are you sure you want to continue?`
    );

    if (!userConfirmed) return;

    setLoading(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_DELETE_ENDPOINT}`,
        {
          headers: { "x-api-key": process.env.REACT_APP_API_KEY },
          params: { fileName },
        }
      );

      console.log("File deleted successfully.");
      onDelete(fileName);
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Could not delete the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr>
      <td className="table-row-play-button">
        <div className="play-button-wrapper">
          <Button
            className="play-button action-button"
            variant="info"
            onClick={handlePlay}
            disabled={loading}
          >
            {loading ? "Loading..." : "Play"}
          </Button>
        </div>
      </td>
      <td>
        <div className="list-table-left">
          <div className="list-name-wrapper">
            {isEditing ? (
              <div className="edit-input-wrapper">
              <label>
                <FormControl
                  id="rename-input"
                  type="text"
                  className="edit-input"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  autoFocus
                />
                </label>
                {error && <span className="error-message">{error}</span>}
              </div>
            ) : (
              <div className="list-file-name">{fileName}</div>
            )}
          </div>
        </div>
      </td>

      <td>
        <div className="action-button-group">
          {!isEditing && (
            <Button
              className="edit-button"
              variant="warning"
              onClick={handleEdit}
              disabled={loading}
            >
              Edit
            </Button>
          )}
          {!isEditing && (
            <Button
              className="delete-button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          {isEditing && (
           <>
              <Button
                className="submit-edit-button"
                variant="success"
                onClick={handleRename}
                disabled={loading}
              >
                Submit
              </Button>
              <Button
                className="cancel-edit-button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default MusicTableRow;

