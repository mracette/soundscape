import { describe, it, expect } from "vitest";
import schema from "./binding.schema.json";
import { TARGET_PROPERTIES, MEASURE_VALUES } from "./types";

describe("binding schema / type sync", () => {
  it("TargetProperty tuple matches the JSON Schema targetProperty enum", () => {
    const enumValues = (
      schema as { definitions: { targetProperty: { enum: string[] } } }
    ).definitions.targetProperty.enum;
    expect([...TARGET_PROPERTIES].sort()).toEqual([...enumValues].sort());
  });

  it("Measure values match the JSON Schema source.measure enum", () => {
    const enumValues = (
      schema as {
        definitions: { source: { properties: { measure: { enum: string[] } } } };
      }
    ).definitions.source.properties.measure.enum;
    expect([...MEASURE_VALUES].sort()).toEqual([...enumValues].sort());
  });
});
