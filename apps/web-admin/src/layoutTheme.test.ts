import { describe, expect, it } from "vitest";
import { headerVariantFor, layoutClassFor } from "./layoutTheme";

describe("headerVariantFor", () => {
  it("hides chrome on login", () => {
    expect(headerVariantFor("/login", "employee", true)).toBe("none");
    expect(headerVariantFor("/login", "admin", true)).toBe("none");
  });

  it("hides chrome when signed out", () => {
    expect(headerVariantFor("/queue", "admin", false)).toBe("none");
    expect(headerVariantFor("/", "employee", false)).toBe("none");
  });

  it("uses staff header for dispatchers and admins", () => {
    expect(headerVariantFor("/queue", "dispatcher", true)).toBe("staff");
    expect(headerVariantFor("/reports/1", "admin", true)).toBe("staff");
  });

  it("uses reporter header for employees", () => {
    expect(headerVariantFor("/reporter", "employee", true)).toBe("reporter");
    expect(headerVariantFor("/reporter/new", "employee", true)).toBe("reporter");
  });
});

describe("layoutClassFor", () => {
  it("uses fullscreen layout on login", () => {
    expect(layoutClassFor("/login")).toBe("layout layout--fullscreen");
  });

  it("uses standard layout elsewhere", () => {
    expect(layoutClassFor("/reporter")).toBe("layout");
  });
});
