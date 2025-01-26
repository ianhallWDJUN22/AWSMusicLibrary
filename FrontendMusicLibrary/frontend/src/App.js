import React from "react";

// Import Bootstrap
import { Nav, Navbar, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";

// Import Custom CSS
import "./App.css";

// Import from react-router-dom
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
} from "react-router-dom";

// Import other React Component
import UploadMusicFile from "./Components/upload-music-file.component";
import EditMusicFile from "./Components/edit-music-file.component";
import MusicList from "./Components/music-list.component";

// App Component
const App = () => {
    return (
      <div>
        <Router>
            <div className="App">
                <header className="App-header">
                    <Navbar bg="dark" variant="dark">
                        <Container>
                            <Navbar.Brand>
                                <Link to={"/upload-music-file"} className="nav-link">
                                    Music Library App
                                </Link>
                            </Navbar.Brand>

                            <Nav className="justify-content-end">
                                <Nav>
                                    <Link to={"/upload-music-file"} className="nav-link">
                                        Upload Music File
                                    </Link>
                                </Nav>

                                <Nav>
                                    <Link to={"/music-list"} className="nav-link">
                                        Music List
                                    </Link>
                                </Nav>
                            </Nav>
                        </Container>
                    </Navbar>
                </header>

                <Container>
                    <Row>
                        <Col md={12}>
                            <div className="wrapper">
                                <Routes>
                                    <Route path="/" element={<UploadMusicFile />} />
                                    <Route path="/upload-music-file" element={<UploadMusicFile />} />
                                    <Route path="/edit-music-file/:id" element={<EditMusicFile />} />
                                    <Route path="/music-list" element={<MusicList />} />
                                </Routes>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Router>
        </div>
    );
};

export default App;
// import React from 'react';

// function App() {
//   return (
//     <div>
//       <h1>Hello from a super basic React App!</h1>
//       <p>If you see this text, React is successfully rendering.</p>
//     </div>
//   );
// }

// export default App;