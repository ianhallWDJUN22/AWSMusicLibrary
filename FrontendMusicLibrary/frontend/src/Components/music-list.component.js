import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import MusicTableRow from "./MusicTableRow.js";

const MusicList = () => {
    const [music, setMusic] = useState([]);

    useEffect(() => {
        axios.post("https://msrii21sj5.execute-api.us-east-1.amazonaws.com/test-invoke-stage/uploadMusicResource.aws.com", {
            headers: {
                "x-api-key": process.env.REACT_APP_API_KEY,
                "Content-Type": "application/json",
            },
        })
        .then(({ data }) => setMusic(data))
        .catch(error => console.error("Error fetching music:", error));
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
                    {music.map((res, i) => <MusicTableRow obj={res} key={i} />)}
                </tbody>
            </Table>
        </div>
    );
};

export default MusicList;


//For reference pre-edits:

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Table } from "react-bootstrap";
// import MusicTableRow from "./MusicTableRow.js"


// const MusicList = () => {
//     const [music, setMusic] = useState([]);

//     useEffect(() => {
//         axios
//           .post("https://msrii21sj5.execute-api.us-east-1.amazonaws.com/test-invoke-stage/uploadMusicResource.aws.com", {
//             headers: {
//               "x-api-key": process.env.REACT_APP_API_KEY, 
//               "Content-Type": "application/json"
//             }
//           })
//           .then(({ data }) => {
//             setMusic(data);
//           })
//           .catch((error) => {
//             console.error("Error fetching music:", error);
//           });
//       }, []);

//     const DataTable = () => {
//         return music.map((res, i) => {
//             return <MusicTableRow
//                 obj={res} key={i} />;
//         });
//     };

//     return (
//         <div className="table-wrapper">
//             <Table striped bordered hover>
//                 <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Length</th>
//                         <th>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>{DataTable()}</tbody>
//             </Table>
//         </div>
//     );
// };

// export default MusicList;
