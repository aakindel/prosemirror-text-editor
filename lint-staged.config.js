// from https://paulintrognon.fr/blog/typescript-prettier-eslint-next-js

module.exports = {
  // type check typescript files
  "**/*.(ts|tsx)": () => "npx tsc --skipLibCheck --noEmit",

  // Lint then format typescript and javascript files
  "**/*.(ts|tsx|js)": (filenames) => [
    `npx eslint --fix ${filenames.join(" ")}`,
    `npx prettier --write ${filenames.join(" ")}`,
  ],

  // format markdown, JSON, CSS and SCSS
  "**/*.(md|json|css|scss)": (filenames) =>
    `npx prettier --write ${filenames.join(" ")}`,
};
