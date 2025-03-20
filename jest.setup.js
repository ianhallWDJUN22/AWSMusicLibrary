console.log("Running jest.setup.js...");
process.env.BUCKET_NAME = process.env.BUCKET_NAME || "test-bucket";


console.log("BUCKET_NAME set to:", process.env.BUCKET_NAME);
