//src/Components/StudentTableRow.js

import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const MusicTableRow = (props) => {
  const {
    _id,
    name,
    //songLength <- from meta data?
  } = props.obj;

  const deleteMusicFile = () => {
    axios
      .delete(
        //v Need to get correct http for axios call ****.
        "http://" + _id
      )
      .then((res) => {
        if (res.status === 200) {
          alert("File successfully deleted");
          window.location.reload();
        } else Promise.reject();
      })
      .catch((err) => alert("Something went wrong"));
  };

  return (
    <tr>
      <td>{name}</td>
      {/* <td>{length}</td> */}
      {/* will eventually include file length from meta data.  
      Will also possibly include upload date, uploader, 
      last edited date etc. */}
      <td>
        <Link className='edit-link' to={"/edit-music-file/" + _id}>
          Edit
        </Link>
        <Button onClick={deleteMusicFile} size='sm' variant='danger'>
          Delete
        </Button>
      </td>
    </tr>
  );
};

export default MusicTableRow;
