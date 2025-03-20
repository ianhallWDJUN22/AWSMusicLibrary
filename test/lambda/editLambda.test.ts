import { handler } from "../../lambda/editLambda";
import { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

const mockSend = jest.fn();

jest.mock("@aws-sdk/client-s3", () => {
  const original = jest.requireActual("@aws-sdk/client-s3");
  return {
    ...original,
    S3Client: jest.fn().mockImplementation(() => ({
      send: (...args: any[]) => mockSend(...args),
    })),
  };
});

describe("Edit Lambda Handler", () => {
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
    expect(JSON.parse(response.body)).toEqual({
      message: "Bucket name not configured in environment variables",
    });
  });

  test("returns error for missing event body", async () => {
    const response = await handler({});
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: "No file data received" });
  });

  test("returns error for missing filenames", async () => {
    const response = await handler({ body: "{}" });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: "Missing file names" });
  });

  test("returns error if new file name already exists", async () => {
    mockSend.mockResolvedValue({
      Contents: [{ Key: "existing.mp3" }],
      $metadata: {},
    } as ListObjectsV2CommandOutput);

    const response = await handler({
      body: JSON.stringify({ oldFileName: "old.mp3", newFileName: "existing.mp3" }),
    });

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body)).toEqual({ message: "File with this name already exists" });
  });

  test("successfully renames a file", async () => {
    mockSend
      .mockResolvedValueOnce({ Contents: [], $metadata: {} } as ListObjectsV2CommandOutput) // Check if new file name exists
      .mockResolvedValueOnce({}) // Copy operation
      .mockResolvedValueOnce({}); // Delete old file

    const response = await handler({
      body: JSON.stringify({ oldFileName: "old.mp3", newFileName: "new.mp3" }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: "Renamed old.mp3 to new.mp3",
    });
  });

  test("handles unexpected AWS errors gracefully", async () => {
    mockSend.mockRejectedValue(new Error("Unexpected AWS error"));

    const response = await handler({
      body: JSON.stringify({ oldFileName: "old.mp3", newFileName: "new.mp3" }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: "Could not rename file",
      error: "Unexpected AWS error",
    });
  });
});


