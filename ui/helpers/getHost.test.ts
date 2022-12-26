import { getHost } from './getHost';

describe('getHost', () => {
  it('should return the host value when provided with an object', async () => {
    const myObject = {
      headers: {
        host: 'this is my host',
      },
    };
    const result = await getHost(myObject);
    expect(result).toBe(myObject.headers.host);
  });

  it('should return null when provided with an incompatible object', async () => {
    const myObject = {
      headers: {},
    };
    const result = await getHost(myObject);
    expect(result).toBeNull();
  });
});
