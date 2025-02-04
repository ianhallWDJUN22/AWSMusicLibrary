import React from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FormGroup, FormControl, Button } from "react-bootstrap";

const MusicUploadForm = ({ onFileSelect, ...props }) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
  });

  return (
    <div className="form-wrapper">
      <Formik {...props} validationSchema={validationSchema}>
        {({ setFieldValue }) => (
          <Form>
            <FormGroup>
              <label>File Name</label>
              <Field name="name" type="text" className="form-control" />
              <ErrorMessage name="name" className="d-block invalid-feedback" component="span" />
            </FormGroup>

            <FormGroup>
              <label>Upload File</label>
              <FormControl
                type="file"
                accept=".mp3"
                onChange={(event) => {
                  const file = event.target.files[0];
                  if (file) {
                    onFileSelect(file); // Send file to parent component
                    setFieldValue("file", file);
                  }
                }}
              />
            </FormGroup>

            <Button variant="danger" size="lg" block="block" type="submit">
              {props.children}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MusicUploadForm;


// import React from "react";
// import * as Yup from "yup";
// import {
//     Formik, Form,
//     Field, ErrorMessage
// } from "formik";
// import {
//     FormGroup,
//     FormControl, Button
// } from "react-bootstrap";

// const MusicUploadForm = (props) => {
//     const validationSchema =
//         Yup.object().shape({
//             name: Yup.string().required("Required"),
//         });
//     console.log(props);
//     return (
//         <div className="form-wrapper">
//             <Formik {...props}
//                 validationSchema={validationSchema}>
//                 <Form>
//                     <FormGroup>
//                         <Field name="File Name" type="text"
//                             className="form-control" />
//                         <ErrorMessage
//                             name="File name"
//                             className="d-block 
//                                 invalid-feedback"
//                             component="span"
//                         />
//                         {/* Need to properly implement a file uploader in this file */}
//                     </FormGroup>
//                     <Button variant="danger" size="lg"
//                         block="block" type="submit">
//                         {props.children}
//                     </Button>
//                 </Form>
//             </Formik>
//         </div>
//     );
// };

// export default MusicUploadForm;