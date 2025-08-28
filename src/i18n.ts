import messages from './messages.de.json';

export function t(key: string): string {
  return key.split('.').reduce<any>((acc, part) => acc?.[part], messages) ?? key;
}
