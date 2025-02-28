import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import MusicTableRow from "./MusicTableRow.js";

const MusicList = () => {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMusicList();
  }, []);

  const fetchMusicList = () => {
    axios
      .get(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_GET_ENDPOINT}`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then(({ data }) => {
        setMusic(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching music:", error);
        setLoading(false);
      });
  };

  // Ensures file is actually deleted from S3 before updating UI
  const handleDeleteFile = async (fileName) => {
    setMusic((prevMusic) => prevMusic.filter((file) => file.fileName !== fileName));
  };

  const handleRenameFile = (oldFileName, newFileName) => {
    setMusic((prevMusic) =>
      prevMusic.map((file) =>
        file.fileName === oldFileName ? { ...file, fileName: newFileName } : file
      )
    );
  };

  return (
    <div className="table-wrapper">
      <h2 className="music-list-header">Music List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table className="table-background" striped bordered hover>
          <thead className="table-row-head">
            <tr></tr>
          </thead>
          <tbody>
            {music.length > 0 ? (
              music.map((file) => (
                <MusicTableRow
                  obj={file}
                  key={file.fileName}
                  onDelete={handleDeleteFile}
                  onRename={handleRenameFile}
                />
              ))
            ) : (
              <tr>
                <td colSpan="3">No files found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MusicList;
