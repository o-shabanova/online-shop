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
    "selector-class-pattern": [
      "^[a-z]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$",
      {
        message:
          "Expected class selector to be BEM-style: block__element--modifier in kebab-case"
      }
    ],
    "color-hex-length": "short",
    "color-named": null,
    "selector-type-no-unknown": true,
    "no-descending-specificity": null,
    "font-family-no-missing-generic-family-keyword": null,
    "declaration-no-important": null,
    "length-zero-no-unit": true,
    "max-nesting-depth": null,
    "number-max-precision": 4,

    "scss/dollar-variable-pattern": "^[a-z][a-z0-9-]*$",
    "scss/percent-placeholder-pattern": "^[a-z][a-z0-9-]*$",
    "scss/at-mixin-pattern": "^[a-z][a-z0-9-]*$",
    "scss/at-function-pattern": "^[a-z][a-z0-9-]*$",
    "scss/no-global-function-names": null,
    "scss/selector-no-redundant-nesting-selector": null,

    "selector-max-id": 0,


    "order/order": [
      [
        { type: "at-rule", name: "use" },
        { type: "at-rule", name: "forward" },
        { type: "at-rule", name: "import" },
        "dollar-variables",
        { type: "at-rule", name: "extend" },
        { type: "at-rule", name: "include" },
        "custom-properties",
        "declarations",
        { type: "at-rule", name: "media" },
        { type: "rule", selector: /^&/ }
      ],
      { unspecified: "bottom" }
    ],

    "order/properties-order": [
      [
        { groupName: "Positioning", properties: ["position","inset","top","right","bottom","left","z-index"] },
        { groupName: "Display & Box", properties: ["display","visibility","overflow","overflow-x","overflow-y","box-sizing"] },
        { groupName: "Flex & Grid", properties: ["flex","flex-grow","flex-shrink","flex-basis","flex-flow","flex-direction","flex-wrap","order","justify-content","align-items","align-self","gap","row-gap","column-gap","grid","grid-template","grid-template-rows","grid-template-columns","grid-row","grid-column","grid-auto-flow","place-items","place-content"] },
        { groupName: "Sizing", properties: ["width","min-width","max-width","height","min-height","max-height"] },
        { groupName: "Spacing", properties: ["margin","margin-top","margin-right","margin-bottom","margin-left","padding","padding-top","padding-right","padding-bottom","padding-left"] },
        { groupName: "Borders", properties: ["border","border-width","border-style","border-color","border-radius"] },
        { groupName: "Background", properties: ["background","background-color","background-image","background-position","background-size","background-repeat"] },
        { groupName: "Typography", properties: ["font","font-family","font-size","font-weight","line-height","letter-spacing","text-align","text-transform","text-decoration","color","white-space"] },
        { groupName: "Effects & Misc", properties: ["opacity","cursor","pointer-events","transition","transform","animation"] }
      ],
      { unspecified: "bottom" }
    ]
    ,
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


