module.exports = {
  extends: [
    "stylelint-config-recommended-scss",
    "stylelint-config-standard-scss"
  ],
  plugins: [
    "stylelint-order",
    "stylelint-scss"
  ],
  rules: {
    /* Allow BEM naming for classes */
    "selector-class-pattern": [
      "^[a-z]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$",
      {
        message:
          "Expected class selector to be BEM-style: block__element--modifier in kebab-case"
      }
    ],
    /* General CSS rules */
    "color-hex-length": "short",
    "color-named": null,
    "selector-type-no-unknown": true,
    "no-descending-specificity": null,
    "font-family-no-missing-generic-family-keyword": null,
    "declaration-no-important": null,
    "length-zero-no-unit": true,
    "max-nesting-depth": null,
    "number-max-precision": 4,

    /* SCSS specific */
    "scss/dollar-variable-pattern": "^[a-z][a-z0-9-]*$",
    "scss/percent-placeholder-pattern": "^[a-z][a-z0-9-]*$",
    "scss/at-mixin-pattern": "^[a-z][a-z0-9-]*$",
    "scss/at-function-pattern": "^[a-z][a-z0-9-]*$",
    "scss/no-global-function-names": null,
    "scss/selector-no-redundant-nesting-selector": null,

    /* Encourage class-based styling, avoid IDs */
    "selector-max-id": 0,

    /* Temporarily disable strict ordering to onboard linter without massive churn */
    "order/order": null,

    "order/properties-order": null
    ,
    /* Additional relaxations to align with current codebase */
    "color-function-notation": null,
    "alpha-value-notation": null,
    "media-feature-range-notation": null,
    "property-no-vendor-prefix": null,
    "scss/at-extend-no-missing-placeholder": null,
    "no-duplicate-selectors": null,
    "declaration-block-single-line-max-declarations": null,
    "no-invalid-position-declaration": null
  },
  overrides: [
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss"
    }
  ]
};


