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

  // Fetch list of MP3 files from S3
  const fetchMusicList = () => {
    axios
      .post(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_UPLOAD_ENDPOINT}`,
        { eventType: "list" },
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

  // ✅ Function to remove a deleted file from the UI
  const handleDeleteFile = (deletedFileName) => {
    setMusic((prevMusic) => prevMusic.filter((file) => file.fileName !== deletedFileName));
  };

  const playSong = (downloadUrl) => {
    const audio = new Audio(downloadUrl);
    audio.play();
  };

  return (
    <div className="table-wrapper">
      <h2 className='music-list-header'>Music List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table className='table-background' striped bordered hover>
          <thead className='table-row-head'>
          <tr></tr>
          </thead>
          <tbody>
            {music.length > 0 ? (
              music.map((file) => (
                <MusicTableRow
                  obj={file}
                  key={file.fileName}
                  playSong={() => playSong(file.downloadUrl)}
                  onDelete={handleDeleteFile} // ✅ Pass delete handler to MusicTableRow
                />
              ))
            ) : (
              <tr>
                <td colSpan="2">No files found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MusicList;
