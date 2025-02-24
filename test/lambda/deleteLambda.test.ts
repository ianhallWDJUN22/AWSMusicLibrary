import { handler } from '../../lambda/deleteLambda';

const mockSend = jest.fn();

// Jest mock AWS SDK clients correctly using Jest factory functions
jest.mock('@aws-sdk/client-s3', () => {
  const original = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...original,
    S3Client: jest.fn().mockImplementation(() => ({
      send: (...args: any[]) => mockSend(...args),
    })),
  };
});

describe('deleteLambda', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, BUCKET_NAME: 'test-bucket' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('returns 500 if BUCKET_NAME is not set', async () => {
    delete process.env.BUCKET_NAME;

    const response = await handler({});

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Bucket name not configured in environment variables',
    });
  });

  test('returns 400 if fileName is not provided', async () => {
    const response = await handler({ queryStringParameters: {} });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: "Missing 'fileName' in query string parameters",
    });
  });

  test('successfully deletes file from S3', async () => {
    mockSend.mockResolvedValueOnce({});

    const response = await handler({
      queryStringParameters: { fileName: 'song.mp3' },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'File song.mp3 deleted successfully',
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        input: {
          Bucket: 'test-bucket',
          Key: 'song.mp3',
        },
      })
    );
  });

  test('handles S3 client errors', async () => {
    mockSend.mockRejectedValueOnce(new Error('S3 Error'));

    const response = await handler({
      queryStringParameters: { fileName: 'song.mp3' },
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Failed to delete file',
      error: 'S3 Error',
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        input: {
          Bucket: 'test-bucket',
          Key: 'song.mp3',
        },
      })
    );
  });
});
