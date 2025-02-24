import { handler } from '../../lambda/uploadLambda';
import { S3Client, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create mocks directly inside the jest.mock calls
const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const original = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...original,
    S3Client: jest.fn(() => ({
      send: (...args: any[]) => mockSend(...args),
    })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('mocked-presigned-url'),
}));

describe('Lambda Handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, BUCKET_NAME: 'test-bucket' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('should return error if BUCKET_NAME is not configured', async () => {
    delete process.env.BUCKET_NAME;

    const response = await handler({ body: '{}' });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Bucket name not configured' });
  });

  test('should return error for missing event body', async () => {
    const response = await handler({});

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'No file received' });
  });

  test('should handle invalid event type', async () => {
    const response = await handler({ body: JSON.stringify({ eventType: 'invalid' }) });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid event type' });
  });

  test('should successfully list files', async () => {
    mockSend.mockResolvedValue({
      Contents: [{ Key: 'song1.mp3' }, { Key: 'song2.mp3' }],
      $metadata: {},
    } as ListObjectsV2CommandOutput);

    const response = await handler({ body: JSON.stringify({ eventType: 'list' }) });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([
      { fileName: 'song1.mp3', downloadUrl: 'mocked-presigned-url' },
      { fileName: 'song2.mp3', downloadUrl: 'mocked-presigned-url' },
    ]);
    expect(getSignedUrl).toHaveBeenCalledTimes(2);
  });

  test('should return empty array if no files in bucket', async () => {
    mockSend.mockResolvedValue({
      Contents: [],
      $metadata: {},
    } as ListObjectsV2CommandOutput);

    const response = await handler({ body: JSON.stringify({ eventType: 'list' }) });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  test('should handle upload event with duplicate file error', async () => {
    mockSend.mockResolvedValue({
      Contents: [{ Key: 'file.mp3' }],
      $metadata: {},
    } as ListObjectsV2CommandOutput);

    const response = await handler({
      body: JSON.stringify({ eventType: 'upload', fileName: 'file.mp3' }),
    });

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body)).toEqual({ message: 'File with this name already exists' });
  });

  test('should handle upload event successfully', async () => {
    mockSend.mockResolvedValue({
      Contents: [],
      $metadata: {},
    } as ListObjectsV2CommandOutput);

    const response = await handler({
      body: JSON.stringify({ eventType: 'upload', fileName: 'newFile.mp3' }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      fileName: 'newFile.mp3',
      downloadUrl: 'mocked-presigned-url',
    });
    expect(getSignedUrl).toHaveBeenCalled();
  });

  test('should handle get event successfully', async () => {
    const response = await handler({
      body: JSON.stringify({ eventType: 'get', fileName: 'existingFile.mp3' }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      fileName: 'existingFile.mp3',
      downloadUrl: 'mocked-presigned-url',
    });
    expect(getSignedUrl).toHaveBeenCalled();
  });
});
