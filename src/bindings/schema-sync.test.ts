import { describe, it, expect } from "vitest";
import schema from "./binding.schema.json";
import { TARGET_PROPERTIES } from "./types";

describe("binding schema / type sync", () => {
  it("TargetProperty tuple matches the JSON Schema targetProperty enum", () => {
    const enumValues = (
      schema as { definitions: { targetProperty: { enum: string[] } } }
    ).definitions.targetProperty.enum;
    expect([...TARGET_PROPERTIES].sort()).toEqual([...enumValues].sort());
  });
});
