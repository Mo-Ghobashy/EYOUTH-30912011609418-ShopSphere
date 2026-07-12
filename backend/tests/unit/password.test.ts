import { hashPassword, comparePassword } from '../../src/utils/password';

describe('password utils', () => {
  it('hashes and verifies a password', async () => {
    const plain = 'SecurePass123!';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(await comparePassword(plain, hash)).toBe(true);
    expect(await comparePassword('wrong-password', hash)).toBe(false);
  });
});
