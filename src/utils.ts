import { Random } from "roughjs/bin/math";
import { nanoid } from "nanoid";

const random = new Random(Date.now());

export const randomInteger = (): number => Math.floor(random.next() * 2 ** 31);

export const randomId = (): string => nanoid();

export const safeNumber = (number: number): number => Number(number.toFixed(2));