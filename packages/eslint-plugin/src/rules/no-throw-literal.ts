import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isTypeAnyType,
  isTypeUnknownType,
} from '../util';

type MessageIds = 'object' | 'undef';

type Options = [
  {
    allowThrowingAny?: boolean;
    allowThrowingUnknown?: boolean;
  },
];

export default createRule<Options, MessageIds>({
  name: 'no-throw-literal',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow throwing literals as exceptions',
      recommended: 'strict',
      extendsBaseRule: true,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowThrowingAny: {
            type: 'boolean',
          },
          allowThrowingUnknown: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      object: 'Expected an error object to be thrown.',
      undef: 'Do not throw undefined.',
    },
  },
  defaultOptions: [
    {
      allowThrowingAny: true,
      allowThrowingUnknown: true,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isErrorLike(type: ts.Type): boolean {
      if (type.isIntersection()) {
        return type.types.some(isErrorLike);
      }
      if (type.isUnion()) {
        return type.types.every(isErrorLike);
      }

      const symbol = type.getSymbol();
      if (!symbol) {
        return false;
      }

      if (symbol.getName() === 'Error') {
        const declarations = symbol.getDeclarations() ?? [];
        for (const declaration of declarations) {
          const sourceFile = declaration.getSourceFile();
          if (services.program.isSourceFileDefaultLibrary(sourceFile)) {
            return true;
          }
        }
      }

      if (symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) {
        for (const baseType of checker.getBaseTypes(type as ts.InterfaceType)) {
          if (isErrorLike(baseType)) {
            return true;
          }
        }
      }

      return false;
    }

    function checkThrowArgument(node: TSESTree.Node): void {
      if (
        node.type === AST_NODE_TYPES.AwaitExpression ||
        node.type === AST_NODE_TYPES.YieldExpression
      ) {
        return;
      }

      const type = services.getTypeAtLocation(node);

      if (type.flags & ts.TypeFlags.Undefined) {
        context.report({ node, messageId: 'undef' });
        return;
      }

      if (options.allowThrowingAny && isTypeAnyType(type)) {
        return;
      }

      if (options.allowThrowingUnknown && isTypeUnknownType(type)) {
        return;
      }

      if (isErrorLike(type)) {
        return;
      }

      context.report({ node, messageId: 'object' });
    }

    return {
      ThrowStatement(node): void {
        if (node.argument) {
          checkThrowArgument(node.argument);
        }
      },
    };
  },
});
