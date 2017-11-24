/**
 * @fileoverview Enforces explicit accessibility modifiers for class members
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/explicit-member-accessibility"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("explicit-member-accessibility", rule, {
    valid: [
        `
class Test {
  protected name: string
  private x: number
  public getX () {
    return this.x
  }
}
        `
    ],
    invalid: [
        {
            code: `
class Test {
  x: number
  public getX () {
    return this.x
  }
}
            `,
            errors: [
                {
                    message:
                        "Missing accessibility modifier on class property x.",
                    line: 3,
                    column: 3
                }
            ]
        },
        {
            code: `
class Test {
  private x: number
  getX () {
    return this.x
  }
}
            `,
            errors: [
                {
                    message:
                        "Missing accessibility modifier on method definition getX.",
                    line: 4,
                    column: 3
                }
            ]
        }
    ]
});
