export default function classNames(...args) {
  const classes = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string') classes.push(arg);
    else if (Array.isArray(arg)) classes.push(classNames(...arg));
    else if (typeof arg === 'object') {
      for (const [key, val] of Object.entries(arg)) {
        if (val) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}
