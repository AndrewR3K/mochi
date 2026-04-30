import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAssetRegistry } from '../src';

describe('asset registry', () => {
  it('loads registered assets once and stores ready state', async () => {
    const assets = createAssetRegistry();
    let loads = 0;
    const record = assets.register('level:one', async () => {
      loads += 1;
      return { name: 'One' };
    });

    const [a, b] = await Promise.all([
      assets.load<{ name: string }>('level:one'),
      assets.load<{ name: string }>('level:one'),
    ]);

    assert.equal(loads, 1);
    assert.equal(a, b);
    assert.equal(record.status, 'ready');
    assert.deepEqual(record.value, { name: 'One' });
  });

  it('preloads selected assets and surfaces load errors', async () => {
    const assets = createAssetRegistry();
    assets.register('good', () => 1);
    assets.register('bad', () => {
      throw new Error('missing');
    });

    await assets.preload(['good']);
    await assert.rejects(() => assets.load('bad'), /missing/);

    assert.equal(assets.get<number>('good')?.status, 'ready');
    assert.equal(assets.get<number>('bad')?.status, 'error');
  });
});
