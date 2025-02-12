import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import MusicTableRow from "./MusicTableRow.js";

const MusicList = () => {
  const [music, setMusic] = useState([]);

  useEffect(() => {
    axios
      .post(
        `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_UPLOAD_ENDPOINT}`,
        { eventType: "get" }, // Ensure Lambda expects this eventType
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then(({ data }) => setMusic(data))
      .catch((error) => console.error("Error fetching music:", error));
  }, []);

  return (
    <div className="table-wrapper">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {music.map((res) => (
            <MusicTableRow obj={res} key={res.fileName} />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MusicList;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Table } from "react-bootstrap";
// import MusicTableRow from "./MusicTableRow.js";

// const MusicList = () => {
//   const [music, setMusic] = useState([]);

//   useEffect(() => {
//     axios
//       .get(
//         `${process.env.REACT_APP_INVOCATION_BASE_URL}/${process.env.REACT_APP_AWS_ENV}/${process.env.REACT_APP_UPLOAD_ENDPOINT}`,

//         {
//           headers: {
//             "x-api-key": process.env.REACT_APP_API_KEY,
//             "Content-Type": "application/json",
//           },
//         }
//       )
//       .then(({ data }) => setMusic(data))
//       .catch((error) => console.error("Error fetching music:", error));
//   }, []);

//   return (
//     <div className='table-wrapper'>
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {music.map((res, i) => (
//             <MusicTableRow obj={res} key={i} />
//           ))}
//         </tbody>
//       </Table>
//     </div>
//   );
// };

// export default MusicList;