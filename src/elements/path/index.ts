import { ExcalidrawDrawElement } from '../../types'
import { getElementBoundaries } from '../utils'
import pathToPoints from './utils/path-to-points'

const parse = (node: Element) => {
  const data = node.getAttribute('d');
  const color = node.getAttribute('fill');
  const parsedResult = {
    data: '',
    color: '',
  };
  
  if (data) {
    parsedResult.data = data;
  }

  if (color) {
    parsedResult.color = color;
  }

  return parsedResult;
}

export const convert = (node: Element): ExcalidrawDrawElement[] => {
  const { data } = parse(node);
  const elementsPoints = pathToPoints(data);

  console.log('Points:', elementsPoints);

  return elementsPoints.map((points) => {
    const boundaries = getElementBoundaries(points);

    return {
      type: 'draw',
      ...boundaries,
      points,
    };
  });
}
