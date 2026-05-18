import { describe, expect, it } from "vitest";
import { resolveImageUploadMeta, sniffImageMime } from "./imageMime";

describe("sniffImageMime", () => {
  it("detects PNG", () => {
    const buf = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ]);
    expect(sniffImageMime(buf)).toBe("image/png");
  });
});

describe("resolveImageUploadMeta", () => {
  it("uses filename when type is empty", () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "x.png", {
      type: "",
    });
    const meta = resolveImageUploadMeta(
      file,
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]),
    );
    expect(meta?.ext).toBe(".png");
    expect(meta?.contentType).toBe("image/png");
  });
});
