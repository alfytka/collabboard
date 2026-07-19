import { describe, expect, it, vi } from 'vitest';
import { useAsyncState } from './useAsyncState';

describe('useAsyncState', () => {
  it('loading true saat proses berjalan, false setelah selesai', async () => {
    const asyncFn = vi.fn().mockResolvedValue('hasil');
    const { execute, loading, data } = useAsyncState(asyncFn);

    const promise = execute();
    expect(loading.value).toBe(true); // harus true sebelum promise selesai

    await promise;
    expect(loading.value).toBe(false);
    expect(data.value).toBe('hasil');
  });

  it('mengisi error.value dan tetap re-throw saat asyncFn gagal', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('Gagal fetch'));
    const { execute, error, loading } = useAsyncState(asyncFn);

    await expect(execute()).rejects.toThrow('Gagal fetch');
    expect(error.value).toBe('Gagal fetch');
    expect(loading.value).toBe(false);
  });

  it('meneruskan argumen ke asyncFn dengan benar', async () => {
    const asyncFn = vi.fn().mockResolvedValue('ok');
    const { execute } = useAsyncState(asyncFn);

    await execute('arg1', 42);
    expect(asyncFn).toHaveBeenCalledWith('arg1', 42);
  });
});