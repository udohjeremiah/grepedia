import { adventurer } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

export function getUserAvatar(seed: string) {
  const avatar = createAvatar(adventurer, {
    backgroundColor: ["7fb3ff", "6a8dff", "5a6cff"],
    backgroundType: ["gradientLinear"],
    randomizeIds: true,
    seed,
  }).toDataUri();

  return avatar;
}
