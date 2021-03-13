import { Random } from "roughjs/bin/math";
import { nanoid } from "nanoid";

const random = new Random(Date.now());

export const randomInteger = (): number => Math.floor(random.next() * 2 ** 31);

export const randomId = (): string => nanoid();

export const safeNumber = (number: number): number => Number(number.toFixed(2));

export function dimensionsFromPoints(points: number[][]): number[] {
  const xCoords = points.map(([x]) => x);
  const yCoords = points.map(([, y]) => y);

  const minX = Math.min(...xCoords);
  const minY = Math.min(...yCoords);
  const maxX = Math.max(...xCoords);
  const maxY = Math.max(...yCoords);

  return [maxX - minX, maxY - minY];
}