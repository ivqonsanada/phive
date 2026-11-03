/**
 * Stand-in photos for people and projects that have none yet: the same two placeholder
 * services the offline demo fixtures use. Seeded by a stable id, so someone keeps the
 * same face and a project the same cover on every page and every render, and hydration
 * has nothing to disagree about.
 */
export const placeholderAvatar = (seed: string) =>
  `https://i.pravatar.cc/300?u=${encodeURIComponent(seed)}`;

export const placeholderCover = (seed: string, width = 680, height = 500) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
