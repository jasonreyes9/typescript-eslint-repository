import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameterInstantiation } from '../../special/TSTypeParameterInstantiation/spec';
import type { CallExpressionArgument } from '../../unions/CallExpressionArgument';
import type { LeftHandSideExpression } from '../../unions/LeftHandSideExpression';

export interface NewExpression extends BaseNode {
  type: AST_NODE_TYPES.NewExpression;
  callee: LeftHandSideExpression;
  arguments: CallExpressionArgument[];
  typeArguments: TSTypeParameterInstantiation | undefined;

  /** @deprecated Use {@link `typeArguments`} instead. */
  typeParameters: TSTypeParameterInstantiation | undefined;
}
