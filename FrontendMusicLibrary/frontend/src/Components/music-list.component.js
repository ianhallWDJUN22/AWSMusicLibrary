import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import MusicTableRow from "./MusicTableRow.js";

const MusicList = () => {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true); // To show loading indicator while fetching

  useEffect(() => {
    // Fetching list of files from S3 using the Lambda function (with eventType 'list')
    axios
      .post(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_UPLOAD_ENDPOINT}`,
        { eventType: "list" }, // Requesting the list of files from Lambda
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then(({ data }) => {
        // If data exists, update the state with the list of files and their presigned URLs
        setMusic(data);
        setLoading(false); // Stop loading once data is received
      })
      .catch((error) => {
        console.error("Error fetching music:", error);
        setLoading(false); // Stop loading even if there's an error
      });
  }, []);

  const playSong = (downloadUrl) => {
    const audio = new Audio(downloadUrl);
    audio.play(); // Play the song directly using the presigned URL
  };

  return (
    <div className="table-wrapper">
      <h2>Music List</h2>
      {loading ? (
        <p>Loading...</p> // Show loading text while fetching data
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {music.length > 0 ? (
              music.map((file) => (
                <MusicTableRow
                  obj={file}
                  key={file.fileName}
                  playSong={() => playSong(file.downloadUrl)} // Pass playSong function to the row
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