import { handler } from "../../lambda/uploadLambda";
import { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

// Declare mockSend at the top-level with a Jest mock
const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn().mockResolvedValue("mocked-presigned-url");

// Jest mock AWS SDK clients correctly using Jest factory functions
jest.mock("@aws-sdk/client-s3", () => {
  const original = jest.requireActual("@aws-sdk/client-s3");
  return {
    ...original,
    S3Client: jest.fn().mockImplementation(() => ({
      send: (...args: any[]) => mockSend(...args),
    })),
  };
});

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: any[]) => mockGetSignedUrl(...args),
}));

describe("Upload Lambda Handler", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, BUCKET_NAME: "test-bucket" };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("returns error if BUCKET_NAME is not configured", async () => {
    delete process.env.BUCKET_NAME;
    const response = await handler({ body: "{}" });
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: "Bucket name not configured" });
  });

  test("returns error for missing event body", async () => {
    const response = await handler({});
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: "No file data received" });
  });

  test("returns error if fileName is missing", async () => {
    const response = await handler({ body: JSON.stringify({}) });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: "File name is required" });
  });

  test("handles upload request with duplicate file error", async () => {
    mockSend.mockResolvedValueOnce({
      Contents: [{ Key: "file.mp3" }],
    } as ListObjectsV2CommandOutput);

    const response = await handler({
      body: JSON.stringify({ fileName: "file.mp3" }),
    });

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body)).toEqual({ message: "File with this name already exists" });
  });

  test("successfully generates a presigned upload URL", async () => {
    mockSend.mockResolvedValueOnce({ Contents: [] });

    const response = await handler({
      body: JSON.stringify({ fileName: "newFile.mp3" }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      fileName: "newFile.mp3",
      downloadUrl: "mocked-presigned-url",
    });

    // Ensure `getSignedUrl` is called with the correct arguments
    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.any(Object), // Mocked S3Client instance
      expect.objectContaining({ input: { Bucket: "test-bucket", Key: "newFile.mp3" } }),
      { expiresIn: 15 * 60 }
    );
  });

  test("handles unexpected errors", async () => {
    mockSend.mockRejectedValueOnce(new Error("Unexpected error"));

    const response = await handler({
      body: JSON.stringify({ fileName: "newFile.mp3" }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: "Could not generate presigned URL" });
  });
});