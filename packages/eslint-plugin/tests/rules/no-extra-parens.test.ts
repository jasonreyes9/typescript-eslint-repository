import rule from '../../src/rules/no-extra-parens';
import { RuleTester, batchedSingleLineTests } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-extra-parens', rule, {
  valid: [
    ...batchedSingleLineTests({
      code: `
(0).toString();
(function(){}) ? a() : b();
(/^a$/).test(x);
for (a of (b, c));
for (a of b);
for (a in b, c);
for (a in b);
      `,
    }),
    `t.true((me.get as SinonStub).calledWithExactly('/foo', other));`,
    ...batchedSingleLineTests({
      code: `
while ((foo = bar())) {}
if ((foo = bar())) {}
do; while ((foo = bar()))
for (;(a = b););
      `,
      options: ['all', { conditionalAssign: false }],
    }),
    {
      code: `
        function a(b) {
          return (b = 1);
        }
      `,
      options: ['all', { returnAssign: false }],
    },
    {
      code: `
        function a(b) {
          return b ? (c = d) : (c = e);
        }
      `,
      options: ['all', { returnAssign: false }],
    },
    {
      code: `b => (b = 1);`,
      options: ['all', { returnAssign: false }],
    },
    {
      code: `b => b ? (c = d) : (c = e);`,
      options: ['all', { returnAssign: false }],
    },
    ...batchedSingleLineTests({
      code: `
x = a || (b && c);
x = a + (b * c);
x = (a * b) / c;
      `,
      options: ['all', { nestedBinaryExpressions: false }],
    }),
    {
      code: `
const Component = (<div />)
const Component = (
    <div
        prop={true}
    />
)
      `,
      options: ['all', { ignoreJSX: 'all' }],
    },
    {
      code: `
const Component = (
    <div>
        <p />
    </div>
)
const Component = (
    <div
        prop={true}
    />
)
      `,
      options: ['all', { ignoreJSX: 'multi-line' }],
    },
    ...batchedSingleLineTests({
      code: `
const Component = (<div />)
const Component = (<div><p /></div>)
      `,
      options: ['all', { ignoreJSX: 'single-line' }],
    }),
    ...batchedSingleLineTests({
      code: `
const b = a => 1 ? 2 : 3;
const d = c => (1 ? 2 : 3);
      `,
      options: ['all', { enforceForArrowConditionals: false }],
    }),
    ...batchedSingleLineTests({
      code: `
(0).toString();
(Object.prototype.toString.call());
({}.toString.call());
(function(){} ? a() : b());
(/^a$/).test(x);
a = (b * c);
(a * b) + c;
typeof (a);
      `,
      options: ['functions'],
    }),
    ...batchedSingleLineTests({
      code: `
[a as b];
() => (1 as 1);
x = a as b;
const x = (1 as 1) | 2;
const x = 1 | (2 as 2);
const x = await (foo as Promise<void>);
const res2 = (fn as foo)();
(x as boolean) ? 1 : 0;
x ? (1 as 1) : 2;
x ? 1 : (2 as 2);
while (foo as boolean) {};
do {} while (foo as boolean);
for (let i of ([] as Foo)) {}
for (let i in ({} as Foo)) {}
for ((1 as 1);;) {}
for (;(1 as 1);) {}
for (;;(1 as 1)) {}
if (1 as 1) {}
const x = (1 as 1).toString();
new (1 as 1)();
const x = { ...(1 as 1), ...{} };
throw (1 as 1);
throw 1;
const x = !(1 as 1);
const x = (1 as 1)++;
function *x() { yield (1 as 1); yield 1; }
switch (foo) { case 1: case (2 as 2): }
      `,
      options: [
        'all',
        {
          nestedBinaryExpressions: false,
        },
      ],
    }),
  ],

  invalid: [
    ...batchedSingleLineTests({
      code: `
a = (b * c);
(a * b) + c;
for (a in (b, c));
for (a in (b));
for (a of (b));
typeof (a);
      `,
      errors: [
        {
          messageId: 'unexpected',
          line: 2,
          column: 5,
        },
        {
          messageId: 'unexpected',
          line: 3,
          column: 1,
        },
        {
          messageId: 'unexpected',
          line: 4,
          column: 11,
        },
        {
          messageId: 'unexpected',
          line: 5,
          column: 11,
        },
        {
          messageId: 'unexpected',
          line: 6,
          column: 11,
        },
        {
          messageId: 'unexpected',
          line: 7,
          column: 8,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: `
const Component = (<div />)
const Component = (<div><p /></div>)
      `,
      options: ['all', { ignoreJSX: 'multi-line' }],
      errors: [
        {
          messageId: 'unexpected',
          line: 2,
          column: 19,
        },
        {
          messageId: 'unexpected',
          line: 3,
          column: 19,
        },
      ],
    }),
    {
      code: `
const Component = (
    <div>
        <p />
    </div>
)
const Component = (
    <div
        prop={true}
    />
)
      `,
      options: ['all', { ignoreJSX: 'single-line' }],
      errors: [
        {
          messageId: 'unexpected',
          line: 2,
          column: 19,
        },
        {
          messageId: 'unexpected',
          line: 7,
          column: 19,
        },
      ],
    },
    ...batchedSingleLineTests({
      code: `
((function foo() {}))();
var y = (function () {return 1;});
      `,
      options: ['functions'],
      errors: [
        {
          messageId: 'unexpected',
          line: 2,
          column: 2,
        },
        {
          messageId: 'unexpected',
          line: 3,
          column: 9,
        },
      ],
    }),
  ],
});
