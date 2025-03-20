import { handler } from "../../lambda/getLambda";
import { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn().mockResolvedValue("mocked-presigned-url");

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

describe("Get Lambda Handler", () => {
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
    const response = await handler({ queryStringParameters: {} });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: "Bucket name not configured in environment variables",
    });
  });

  test("returns empty file list if no files exist", async () => {
    mockSend.mockResolvedValueOnce({
      Contents: [],
      $metadata: {},
    } as ListObjectsV2CommandOutput);

    const response = await handler({ queryStringParameters: {} });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  test("returns a list of files with presigned URLs", async () => {
    mockSend.mockResolvedValueOnce({
      Contents: [{ Key: "song1.mp3" }, { Key: "song2.mp3" }],
      $metadata: {},
    } as ListObjectsV2CommandOutput);

    const response = await handler({ queryStringParameters: {} });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([
      { fileName: "song1.mp3", downloadUrl: "mocked-presigned-url" },
      { fileName: "song2.mp3", downloadUrl: "mocked-presigned-url" },
    ]);

    expect(mockGetSignedUrl).toHaveBeenCalledTimes(2);
  });

  test("returns presigned URL for a specific file", async () => {
    const response = await handler({
      queryStringParameters: { fileName: "existingFile.mp3" },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      fileName: "existingFile.mp3",
      downloadUrl: "mocked-presigned-url",
    });

    expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
  });

  test("handles unexpected errors", async () => {
    mockSend.mockRejectedValueOnce(new Error("S3 Error"));

    const response = await handler({ queryStringParameters: {} });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: "Could not process request",
      error: "S3 Error",
    });
  });
});
