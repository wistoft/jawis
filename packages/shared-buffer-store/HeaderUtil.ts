import { assert, assertEq } from "^jab";

import { readNumber } from "^shared-algs";

export type HeaderUtilDeps = {
  sharedArray: Uint8Array;
  direction: "left" | "right";
  byteSize: number;
};

/**
 *
 */
export type BufferHeader = {
  headerLength: number;
  alignment: number; //align entry to a multiple of this value. 1, 2, 4 or 8 bytes. Default 1.
  version: number;
  bufferLength: number;
};

const BUFFER_LENGTH_BYTES = 4;

const HEADER_LENGTH_OFFSET = 0;
const ALIGNMENT_OFFSET = HEADER_LENGTH_OFFSET + 1;
const VERSION_OFFSET = ALIGNMENT_OFFSET + 1;
const BUFFER_LENGTH_OFFSET = VERSION_OFFSET + 1;

const HEADER_BYTES_WITHOUT_PADDING = BUFFER_LENGTH_OFFSET + BUFFER_LENGTH_BYTES;

/**
 *
 */
export class HeaderUtil {
  /**
   *
   */
  constructor(public deps: HeaderUtilDeps) {}

  /**
   *
   */
  public getDataIndex = (
    index: number,
    dataLength: number,
    headerLength: number
  ) => {
    assertEq(HEADER_BYTES_WITHOUT_PADDING, headerLength, "Not sure it works without this condition"); // prettier-ignore

    if (this.deps.direction === "right") {
      return index + headerLength;
    } else {
      return index - dataLength + HEADER_BYTES_WITHOUT_PADDING - headerLength;
    }
  };

  /**
   * Calculates the data to be stored in the header.
   *
   * - The result is an array of bytes.
   * - Doesn't have to check that numbers fit in each byte, because it's checked at write to buffer.
   * - Can return a different amount of bytes, than is stored in headerlength. Because of padding.
   *
   */
  public prepare(index: number, header: Omit<BufferHeader, "headerLength">) {
    if (
      header.alignment !== 1 &&
      header.alignment !== 2 &&
      header.alignment !== 4 &&
      header.alignment !== 8
    ) {
      throw new Error(
        "This alignment value not implemented: " + header.alignment
      );
    }

    //header length

    const res: number[] = [0]; //headerLength will be updated below.

    //alignment

    res.push(header.alignment);

    //version

    res.push(header.version);

    //data length

    let tmp2 = header.bufferLength;

    for (let i = 0; i < BUFFER_LENGTH_BYTES; i++) {
      res.push(tmp2 & 0xff);
      tmp2 = tmp2 >> 8;
    }

    //figure alignment.

    if (this.deps.direction === "right") {
      this.makeRightPadding(res, index, header);
    } else {
      this.makeLeftPadding(res, index, header);
    }

    //set header length.

    res[0] = res.length;

    return res;
  }

  /**
   * Pad the header. (in right direction mode)
   *
   *  - The header size is increased enough, so the dataIndex is moved enough to the right.
   */
  public makeRightPadding(
    res: number[],
    index: number,
    header: Omit<BufferHeader, "headerLength">
  ) {
    const mask = header.alignment - 1; // for align=4, this becomes 00000011

    const dataIndex = index + res.length;
    const tooMuch = dataIndex & mask;

    const padding = tooMuch === 0 ? 0 : header.alignment - tooMuch;

    for (let i = 0; i < padding; i++) {
      res.push(0);
    }
  }

  /**
   * Pad the header. (in left direction mode)
   *
   *  - The header size is increased enough, so the dataIndex is moved enough to the left.
   *  - Note this technique works without knowning whether to right edge is aligned to 8 bytes.
   */
  public makeLeftPadding(
    res: number[],
    index: number,
    header: Omit<BufferHeader, "headerLength">
  ) {
    const mask = header.alignment - 1; // for align=4, this becomes 00000011

    const dataIndex = index - res.length - header.bufferLength;
    const tooMuch = dataIndex & mask;

    for (let i = 0; i < tooMuch; i++) {
      res.push(0);
    }
  }

  /**
   *
   */
  public set(index: number, header: number[]) {
    if (this.deps.direction === "right") {
      index = index + HEADER_BYTES_WITHOUT_PADDING - header.length;
    }

    this.deps.sharedArray.set(header, index);
  }

  /**
   *
   */
  public get(index: number) {
    const bufferLength = readNumber(
      this.deps.sharedArray,
      index + BUFFER_LENGTH_OFFSET,
      BUFFER_LENGTH_BYTES
    );

    return {
      headerLength: this.deps.sharedArray[index + HEADER_LENGTH_OFFSET],
      bufferLength,
    };
  }

  /**
   *
   */
  public delete = (ref: number) => {
    const index = this.decodeRef(ref);

    this.deps.sharedArray[index + VERSION_OFFSET] = 0;
  };

  /**
   *
   */
  public encode = (oldFreePointer: number, version: number) => {
    //calculate index of the header.

    let index;

    if (this.deps.direction === "right") {
      index = oldFreePointer;
    } else {
      index = oldFreePointer - HEADER_BYTES_WITHOUT_PADDING;
    }

    //check

    if (version > 15) {
      throw new Error("Version too high");
    }

    if (index > 2e28) {
      throw new Error("Buffer index is too high to store.");
    }

    return { index, ref: version + (index << 4) };
  };

  /**
   *
   */
  public decodeRef = (ref: number) => {
    const version = ref & 0xf;
    const index = (ref & 0xfffffff0) >> 4;

    const expVersion = this.deps.sharedArray[index + VERSION_OFFSET];

    assert(
      index >= 0 && index < this.deps.byteSize && expVersion === version,
      "Buffer index isn't valid: ",
      {
        ref,
        index,
        version,
        expVersion,
      }
    );

    return index;
  };
}
