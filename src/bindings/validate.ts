import { TARGET_PROPERTIES, MEASURE_VALUES } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const TARGET_SET = new Set<string>(TARGET_PROPERTIES);
const MEASURES = new Set<string>(MEASURE_VALUES);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectUnknownKeys(
  obj: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  errors: string[]
): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      errors.push(`${path} has unknown property "${key}"`);
    }
  }
}

/** Validate the object stored at `object.userData.soundscape`. */
export function validateUserData(value: unknown): ValidationResult {
  if (!isPlainObject(value)) {
    return { valid: false, errors: ["userData must be an object"] };
  }
  if (!Array.isArray(value.bindings)) {
    return { valid: false, errors: ["userData.bindings must be an array"] };
  }
  const errors: string[] = [];
  value.bindings.forEach((binding, i) =>
    validateBinding(binding, `bindings[${i}]`, errors)
  );
  return { valid: errors.length === 0, errors };
}

/** Validate one binding, appending messages (prefixed by `path`) to `errors`. */
export function validateBinding(
  value: unknown,
  path: string,
  errors: string[]
): void {
  if (!isPlainObject(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  rejectUnknownKeys(value, ["target", "source", "transform"], path, errors);

  const target = value.target;
  if (!isPlainObject(target)) {
    errors.push(`${path}.target must be an object`);
  } else {
    rejectUnknownKeys(target, ["property"], `${path}.target`, errors);
    if (!TARGET_SET.has(String(target.property))) {
      errors.push(
        `${path}.target.property "${String(target.property)}" is not a known target`
      );
    }
  }

  const source = value.source;
  if (!isPlainObject(source)) {
    errors.push(`${path}.source must be an object`);
  } else {
    rejectUnknownKeys(source, ["band", "measure", "bucket"], `${path}.source`, errors);
    if (typeof source.band !== "string" || source.band.length === 0) {
      errors.push(`${path}.source.band must be a non-empty string`);
    }
    if (!MEASURES.has(String(source.measure))) {
      errors.push(`${path}.source.measure must be "volume" or "bucket"`);
    }
    if (source.measure === "bucket") {
      if (!Number.isInteger(source.bucket) || (source.bucket as number) < 0) {
        errors.push(
          `${path}.source.bucket must be a non-negative integer when measure is "bucket"`
        );
      }
    } else if (source.bucket !== undefined) {
      errors.push(`${path}.source.bucket is only allowed when measure is "bucket"`);
    }
  }

  const transform = value.transform;
  if (!isPlainObject(transform)) {
    errors.push(`${path}.transform must be an object`);
  } else {
    rejectUnknownKeys(transform, ["gate", "exponent", "ease", "smoothing", "outMin", "outMax"], `${path}.transform`, errors);
    if (typeof transform.outMin !== "number") {
      errors.push(`${path}.transform.outMin must be a number`);
    }
    if (typeof transform.outMax !== "number") {
      errors.push(`${path}.transform.outMax must be a number`);
    }
    if (
      transform.gate !== undefined &&
      (typeof transform.gate !== "number" || transform.gate < 0 || transform.gate >= 1)
    ) {
      errors.push(`${path}.transform.gate must be a number in [0,1)`);
    }
    if (
      transform.exponent !== undefined &&
      (typeof transform.exponent !== "number" || transform.exponent <= 0)
    ) {
      errors.push(`${path}.transform.exponent must be a positive number`);
    }
    if (
      transform.ease !== undefined &&
      (typeof transform.ease !== "string" || transform.ease.length === 0)
    ) {
      errors.push(`${path}.transform.ease must be a non-empty string`);
    }
    if (transform.smoothing !== undefined) {
      if (!isPlainObject(transform.smoothing)) {
        errors.push(`${path}.transform.smoothing must be an object`);
      } else {
        rejectUnknownKeys(transform.smoothing, ["attack", "release"], `${path}.transform.smoothing`, errors);
        for (const key of ["attack", "release"] as const) {
          const v = transform.smoothing[key];
          if (typeof v !== "number" || v < 0 || v > 1) {
            errors.push(
              `${path}.transform.smoothing.${key} must be a number in [0,1]`
            );
          }
        }
      }
    }
  }
}
