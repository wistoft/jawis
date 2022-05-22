import {
  DEFAULT_NUM_LENGTH_BYTES,
  ExclusiveKey,
  readNumber,
  SharedKey,
} from "^jab-node";
import { assert } from "^jab/error";
import { SharedBufferStoreLockSystem } from "./SharedBufferStoreLockSystem";

export type Deps = {
  heap: Uint8Array;
  direction: "left" | "right";
  sabByteSize: number;
  locks: SharedBufferStoreLockSystem;
};

/**
 * dataLength is preserved for deleted entries. So they can be pruned.
 */
export type EntryHeader = {
  headerLength: number;
  accessCount: number;
  deleted: boolean;
  alignment: number; //align entry to a multiple of this value. E.g. 2, 4 or 8 bytes. Default 1.
  ref: number;
  dataLength: number;
};

/**
 *
 */
export class SharedBufferStoreEntryHeader {
  readonly NUM_ACCESS_COUNT_BYTES = 1;
  readonly NUM_REFERENCE_BYTES = 4; //up to 4Gi references.

  private HEADER_LENGTH_OFFSET;
  private ACCESS_COUNT_OFFSET;
  private IS_DELETED_OFFSET;
  private ALIGNMENT_OFFSET;
  private REFERENCE_OFFSET;
  private LENGTH_OFFSET;

  public static HEADER_BYTE_LENGTH = 12; //excluding padding.

  /**
   *
   */
  constructor(public deps: Deps) {
    this.HEADER_LENGTH_OFFSET = 0;
    this.ACCESS_COUNT_OFFSET = 1;
    this.IS_DELETED_OFFSET = 2;
    this.ALIGNMENT_OFFSET = 3;
    this.REFERENCE_OFFSET = this.ALIGNMENT_OFFSET + 1;
    this.LENGTH_OFFSET = this.REFERENCE_OFFSET + this.NUM_REFERENCE_BYTES;

    const headerLength = this.LENGTH_OFFSET + DEFAULT_NUM_LENGTH_BYTES;

    assert(headerLength === SharedBufferStoreEntryHeader.HEADER_BYTE_LENGTH);
  }

  /**
   *
   */
  public static getDataIndex = (
    index: number,
    dataLength: number,
    headerLength: number,
    direction: "left" | "right"
  ) => {
    if (direction === "right") {
      return index + headerLength;
    } else {
      return (
        index -
        dataLength +
        SharedBufferStoreEntryHeader.HEADER_BYTE_LENGTH -
        headerLength
      );
    }
  };

  /**
   * Calculates the values for the header.
   *
   * - Doesn't have to check that numbers fit in each byte, because it's checked at write to buffer.
   * - Can return a different amount of bytes, than is stored in headerlength. This is meant for
   *    making space for
   *
   * header format
   *    1 byte    header length
   *    1 byte    access count
   *    1 byte    is deleted
   *    1 byte    byte alignment
   *    4 byte    reference returned to user
   *    4 byte    data length
   */
  public prepare(index: number, header: Omit<EntryHeader, "headerLength">) {
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

    //make the data.

    const res: number[] = [0]; //headerLength will be updated below.

    res.push(header.accessCount);
    res.push(header.deleted ? 1 : 0);
    res.push(header.alignment);

    //quick fix
    let tmp = header.ref;

    for (let i = 0; i < this.NUM_REFERENCE_BYTES; i++) {
      res.push(tmp & 0xff);
      tmp = tmp >> 8;
    }

    //quick fix
    let tmp2 = header.dataLength;

    for (let i = 0; i < DEFAULT_NUM_LENGTH_BYTES; i++) {
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
   */
  public makeRightPadding(
    res: number[],
    index: number,
    header: Omit<EntryHeader, "headerLength">
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
   * Pad the header. (in lrft direction mode)
   */
  public makeLeftPadding(
    res: number[],
    index: number,
    header: Omit<EntryHeader, "headerLength">
  ) {
    const mask = header.alignment - 1; // for align=4, this becomes 00000011

    const dataIndex = index - res.length - header.dataLength;
    const tooMuch = dataIndex & mask;

    // console.log(index - res.length - header.dataLength);
    // const padding = tooMuch === 0 ? 0 : header.alignment - tooMuch;

    for (let i = 0; i < tooMuch; i++) {
      res.push(0);
    }
  }

  /**
   * Padding amount. (in left direction mode)
   */
  public getLeftPadding(index: number, dataLength: number, alignment: number) {
    const mask = alignment - 1; // for align=4, this becomes 00000011

    const dataIndex = index - dataLength;

    return dataIndex & mask;
  }

  /**
   *
   */
  public set(
    index: number,
    header: number[],
    key: ExclusiveKey<"entry"> | ExclusiveKey<"exclusive">,
    refQuickFix: number
  ) {
    this.deps.locks.assertEntryWrite(key, refQuickFix);

    this.deps.heap.set(header, index);
  }

  /**
   *
   */
  public update(
    index: number,
    header: Partial<EntryHeader>,
    key: ExclusiveKey<"entry"> | ExclusiveKey<"exclusive">,
    refQuickFix: number
  ) {
    this.deps.locks.assertEntryWrite(key, refQuickFix);

    if (header.deleted !== undefined) {
      this.deps.heap[index + this.IS_DELETED_OFFSET] = header.deleted ? 1 : 0;
    }
  }

  /**
   *
   */
  public get(
    index: number,
    key: SharedKey<"entry"> | ExclusiveKey<"entry"> | ExclusiveKey<"exclusive">,
    refQuickFix?: number
  ): EntryHeader {
    this.deps.locks.assertEntryRead(key, refQuickFix);

    const ref = readNumber(
      this.deps.heap,
      index + this.REFERENCE_OFFSET,
      this.NUM_REFERENCE_BYTES
    );

    const dataLength = readNumber(
      this.deps.heap,
      index + this.LENGTH_OFFSET,
      DEFAULT_NUM_LENGTH_BYTES
    );

    return {
      headerLength: this.deps.heap[index + this.HEADER_LENGTH_OFFSET],
      accessCount: this.deps.heap[index + this.ACCESS_COUNT_OFFSET],
      deleted:
        this.deps.heap[index + this.IS_DELETED_OFFSET] === 1 ? true : false,
      alignment: this.deps.heap[index + this.ALIGNMENT_OFFSET],
      ref,
      dataLength,
    };
  }
}
