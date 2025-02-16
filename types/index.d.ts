/// <reference types="node" />
/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare module 'jest-watch-typeahead/filename';
declare module 'jest-watch-typeahead/testname';
declare module 'identity-obj-proxy';

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.styl' {
  const classes: { [key: string]: string };
  export default classes;
} 