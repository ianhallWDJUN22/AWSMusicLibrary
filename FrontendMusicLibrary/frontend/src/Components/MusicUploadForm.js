import React from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FormGroup, FormControl, Button } from "react-bootstrap";

const MusicUploadForm = ({ onFileSelect, ...props }) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("File name is required")
      .matches(
        /^[a-zA-Z0-9-\s_]+$/,
        "File name contains characters that are not allowed"
      ),
    file: Yup.mixed()
      .required("File is required")
      .test("fileType", "Only MP3 files are allowed", (value) =>
        value ? value.type === "audio/mpeg" : false
      ),
  });

  return (
    <div className='form-wrapper'>
      <Formik
        initialValues={{ name: "", file: null }} // Tracks both name and file
        validationSchema={validationSchema}
        {...props}
      >
        {({ setFieldValue }) => (
          <Form>
            {/* File Name Field */}
            <FormGroup>
              <label>File Name</label>
              <Field
                name='name'
                type='text'
                className='form-control'
                placeholder='Enter file name'
              />
              <ErrorMessage
                name='name'
                className='d-block invalid-feedback'
                component='span'
              />
            </FormGroup>

            {/* File Upload Field */}
            <FormGroup>
              <label>Upload File</label>
              <FormControl
                type='file'
                accept='.mp3'
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
                name='file'
                className='d-block invalid-feedback'
                component='span'
              />
            </FormGroup>

            {/* Submit Button */}
            <Button variant='danger' size='lg' block='block' type='submit'>
              {props.children}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MusicUploadForm;
