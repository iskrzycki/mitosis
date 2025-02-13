import generate from '@babel/generator';
import { tryParseJson } from '../../helpers/json';

export const selfClosingTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export const uncapitalize = (str: string) => {
  if (!str) {
    return str;
  }

  return str[0].toLowerCase() + str.slice(1);
};

export const parseCodeJson = (node: babel.types.Node) => {
  const code = generate(node).code;
  return tryParseJson(code);
};
