# Algorithms on typed arrays.

Algorithms and data structures for building concurrent programs.

## Installation

```
npm i shared-algs
```

## Usage

- Compose the structures in this package.
- Manage SharedArrayBuffer. Either create one or use one from another thread.
- Add locks around operations to make them thread safe.

## Design pattern

- Units use a global heap/store by default.
- Units can be made from IntXArray or a heap/store ref.
  - IntXArray is smart because the unit can then be composed in a managed
    structure. But the unit must have fixed size, because it would not be able
    to allocate more data.
  - ref is smart because the unit can be managed as a primitive value.
- Parameters can be stored by the unit, or supplied each time.
  - If the unit stores it, it will give better gurantees a wrong value isn't
    supplied, but it takes extra storage.
  - If params are given, then the storage is saved. Letting parent store the
    values, then it wouldn't be duplicated.
- Units can store its type, so debuging can detect, that a IntXArray isn't
  wrongly instantiated.
- Pack
  - Is only used for top level. Transferring data-structures to other threads is
    only needed once. Then refs can be sent, which would probably be enough.
  - All unit should have pack though, because they will be easier to test
- Unpack
  - The packed value is often just the same as the deps to the unit. So the unit
    should not have an `unpack` method. It cannot rely on everybody remembering
    what to call.
  - If the unit need to initialize itself will need to include a property in its
    packed value `{initialized:true}`
- from ref
  - unit can have an from ref method. Because it's so different from the
    constructor.

## Known issues

## Related work

- [sharedmap](https://www.npmjs.com/package/sharedmap)
- [web-locks](https://www.npmjs.com/package/web-locks)

[npmtrends.com](https://npmtrends.com/memored-vs-node-shared-structures-vs-shared-array-buffer-store-vs-sharedmap-vs-shm-typed-array-vs-web-locks)

## License

MIT
