import Stream from 'stream-browserify';
import inherits from 'inherits';
import Blob from 'blob';

const WritableStream = Stream.Writable;

const URL = global.URL || global.webkitURL || global.mozURL;

function BlobStream() {
  if (!(this instanceof BlobStream)) return new BlobStream();

  WritableStream.call(this);
  this._chunks = [];
  this._blob = null;
  this.length = 0;
}

inherits(BlobStream, WritableStream);

function _write(chunk, encoding, callback) {
  // convert chunks to Uint8Arrays (e.g. Buffer when array fallback is being used)
  const uint8Chunk =
    chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);

  this.length += uint8Chunk.length;
  this._chunks.push(uint8Chunk);
  callback();
}
BlobStream.prototype._write = _write;

function toBlob(type) {
  const blobType = type || 'application/octet-stream';

  // cache the blob if needed
  if (!this._blob) {
    this._blob = new Blob(this._chunks, {
      type: blobType,
    });

    this._chunks = []; // free memory
  }

  // if the cached blob's type doesn't match the requested type, make a new blob
  if (this._blob.type !== blobType)
    this._blob = new Blob([this._blob], { type: blobType });

  return this._blob;
}
BlobStream.prototype.toBlob = toBlob;

function toBlobURL(type) {
  return URL.createObjectURL(this.toBlob(type));
}
BlobStream.prototype.toBlobURL = toBlobURL;

export default BlobStream;
