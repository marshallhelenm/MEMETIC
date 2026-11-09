import memes from "../src/assets/memes.json";
import { memeSampler } from "../src/assets/memeCollection";
import { isBoardLayouts, isGameKeys } from "../src/messages";

const allMemeKeys = Object.keys(memes);

describe("memeSampler", () => {
  afterEach(() => jest.restoreAllMocks());

  it("deals 24 different memes", () => {
    const { allKeys } = memeSampler();

    expect(allKeys).toHaveLength(24);
    expect(new Set(allKeys).size).toBe(24);
    allKeys.forEach((key) => expect(allMemeKeys).toContain(key));
  });

  it("lays the same 24 memes out for every column count from 1 to 6", () => {
    const { allKeys, columnsObject } = memeSampler();

    for (let count = 1; count <= 6; count++) {
      const layout = columnsObject[count];
      expect(Object.keys(layout)).toHaveLength(count);
      const keysInLayout = Object.values(layout).flat();
      expect([...keysInLayout].sort()).toEqual([...allKeys].sort());
    }
  });

  it("can pick the last meme in the collection", () => {
    // The largest value Math.random can return should map to the last remaining meme.
    jest.spyOn(Math, "random").mockReturnValue(0.999999);

    const { allKeys } = memeSampler();

    // allKeys comes back sorted by card height, so check membership rather than position.
    expect(allKeys).toContain(allMemeKeys[allMemeKeys.length - 1]);
  });

  it("deals games the server accepts", () => {
    for (let i = 0; i < 20; i++) {
      const { allKeys, columnsObject } = memeSampler();
      expect(isGameKeys(allKeys)).toBe(true);
      expect(isBoardLayouts(JSON.parse(JSON.stringify(columnsObject)), allKeys)).toBe(true);
    }
  });
});
