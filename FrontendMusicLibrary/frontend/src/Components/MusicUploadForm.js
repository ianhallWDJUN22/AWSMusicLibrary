import React from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FormGroup, FormControl, Button } from "react-bootstrap";

const MusicUploadForm = ({ onFileSelect, ...props }) => {
  // Validation Schema: Ensures file is selected and file name exists
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("File name is required")
      .matches(
        /^[a-zA-Z0-9-\s_]+$/,
        "File name contains characters that are not allowed"
      ),
    file: Yup.mixed()
      .required("File selection is required")
      .test("fileType", "Only MP3 files are allowed", (value) => {
        return value instanceof File && value.type === "audio/mpeg";
      }),
  });

  return (
    <div className="form-wrapper">
      <h2 className="upload-header">Upload Music</h2>
      <Formik
        initialValues={{ name: "", file: null }}
        validationSchema={validationSchema}
        {...props}
      >
        {({ setFieldValue, values }) => (
          <Form>
            {/* File Name Field */}
            <FormGroup className="upload-formgroup">
              <label>File Name</label>
              <Field
                name="name"
                type="text"
                className="form-control"
                placeholder="Enter file name"
              />
              <ErrorMessage
                name="name"
                className="d-block invalid-feedback"
                component="span"
              />
            </FormGroup>

            {/* File Upload Field */}
            <FormGroup className="upload-formgroup">
              <label></label>
              <FormControl
                id="fileInput"
                type="file"
                accept=".mp3"
                onChange={(event) => {
                  const file = event.target.files[0];
                  if (file) {
                    console.log("Selected File:", file);
                    console.log("Detected MIME Type:", file.type);
                    onFileSelect(file);
                    setFieldValue("file", file);
                  }
                }}
              />
              <ErrorMessage
                name="file"
                className="d-block invalid-feedback"
                component="span"
              />
            </FormGroup>

            {/* Submit Button */}
            <Button
              className="button-upload"
              variant="info"
              size="lg"
              block="block"
              type="submit"
            >
              Upload
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MusicUploadForm;
