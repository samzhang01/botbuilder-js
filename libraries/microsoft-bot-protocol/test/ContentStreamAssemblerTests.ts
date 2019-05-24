import { expect } from 'chai';
import { Stream } from 'stream';
import { MockStreamManager } from '../__mocks__/MockStreamManager';
import { ContentStreamAssembler } from '../src/Payloads/Assemblers/ContentStreamAssembler';

describe('ContentStreamAssembler', () => {
  it('assigns values when constructed', () => {
    let csa = new ContentStreamAssembler(new MockStreamManager(), '1', 'stream', 50);
    expect(csa.id)
      .equals('1');
    expect(csa.contentLength)
      .equals(50);
    expect(csa.contentType)
      .equals('stream');
    expect(csa.end)
      .equals(undefined);
  });

  it('returns a Stream', () => {
    let csa = new ContentStreamAssembler(new MockStreamManager(), '1', 'stream', 50);
    expect(csa.createPayloadStream())
      .instanceOf(Stream);
  });
});
