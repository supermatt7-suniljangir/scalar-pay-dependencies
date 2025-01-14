export enum ScalarTagId {
  TODAY_TOP_10 = "today-top-10",
  DAY_ONE_ON_SCALAR = "day-one-on-scalar",
}

export interface ScalarTag {
  tagId: ScalarTagId;
  tagName: string;
  tagDescription: string;
}

const scalarTags: ScalarTag[] = [
  {
    tagId: ScalarTagId.TODAY_TOP_10,
    tagName: "Top 10",
    tagDescription: "Among today's top 10",
  },
  {
    tagId: ScalarTagId.DAY_ONE_ON_SCALAR,
    tagName: "Day One",
    tagDescription: "First day on Scalar",
  },
];

Object.freeze(scalarTags);

// Validation function for Scalar Tags
export function validateScalarTagsConfig(scalarTags: ScalarTag[]): boolean {
  const seenTagIds = new Set<ScalarTagId>();

  for (const tag of scalarTags) {
    if (seenTagIds.has(tag.tagId)) {
      console.error(`Duplicate ScalarTagId found: ${tag.tagId}`);
      return false;
    }
    seenTagIds.add(tag.tagId);
  }

  return true;
}

// Run validation for Scalar Tags
if (!validateScalarTagsConfig(scalarTags)) {
  // TODO: Check if this actually fails build locally or not.
  throw new Error(
    `Duplicate ScalarTagId found. ScalarTags can't have same id.`
  );
}

export { scalarTags };
