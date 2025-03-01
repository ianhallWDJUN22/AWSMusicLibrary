import { handler } from '../../lambda/editLambda';
import { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';

// Declare mockSend at the top-level with a Jest mock
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

describe('Edit Lambda Handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, BUCKET_NAME: 'test-bucket' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('returns error if BUCKET_NAME is not configured', async () => {
    delete process.env.BUCKET_NAME;
    const response = await handler({ body: '{}' });
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toBe('Bucket name not configured');
  });

  test('returns error for missing event body', async () => {
    const response = await handler({});
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'No file data received' });
  });

  test('returns error for missing filenames', async () => {
    const response = await handler({ body: '{}' });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Missing file names' });
  });

  test('returns error if new file name already exists', async () => {
    mockSend.mockResolvedValue({
      Contents: [{ Key: 'existing.mp3' }],
      $metadata: {},
    } as ListObjectsV2CommandOutput);

    const response = await handler({
      body: JSON.stringify({ oldFileName: 'old.mp3', newFileName: 'existing.mp3' }),
    });

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body)).toEqual({ message: 'File with this name already exists' });
  });

  test('successfully renames a file', async () => {
    mockSend
      .mockResolvedValueOnce({ Contents: [], $metadata: {} } as ListObjectsV2CommandOutput) // list command
      .mockResolvedValueOnce({}) // copy command
      .mockResolvedValueOnce({}); // delete command

    const response = await handler({
      body: JSON.stringify({ oldFileName: 'old.mp3', newFileName: 'new.mp3' }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Renamed old.mp3 to new.mp3',
    });
  });

  test('handles exceptions gracefully', async () => {
    mockSend.mockRejectedValue(new Error('Unexpected AWS error'));

    const response = await handler({
      body: JSON.stringify({ oldFileName: 'old.mp3', newFileName: 'new.mp3' }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: 'Could not rename file' });
  });
});

