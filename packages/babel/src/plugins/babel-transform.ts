import type { BabelFile, PluginObj } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import type { Identifier } from '@babel/types';

import { debug } from '@linaria/logger';
import { removeWithRelated, syncResolve } from '@linaria/utils';

import type { Core } from '../babel';
import { TransformCacheCollection } from '../cache';
import { prepareForEvalSync } from '../transform-stages/1-prepare-for-eval';
import evalStage from '../transform-stages/2-eval';
import type { PluginOptions } from '../transform-stages/helpers/loadLinariaOptions';
import loadLinariaOptions from '../transform-stages/helpers/loadLinariaOptions';
import type { IPluginState } from '../types';
import { processTemplateExpression } from '../utils/processTemplateExpression';
import withLinariaMetadata from '../utils/withLinariaMetadata';

export default function collector(
  babel: Core,
  options: Partial<PluginOptions>
): PluginObj<IPluginState> {
  const cache = new TransformCacheCollection();

  return {
    name: '@linaria/babel/babel-transform',
    pre(file: BabelFile) {
      debug('babel-transform:start', file.opts.filename);

      const entrypoint = {
        name: file.opts.filename!,
        code: file.code,
        only: ['__linariaPreval'],
      };

      const pluginOptions = loadLinariaOptions(options);

      const prepareStageResult = prepareForEvalSync(
        babel,
        cache,
        syncResolve,
        entrypoint,
        pluginOptions,
        {
          root: file.opts.root ?? undefined,
          inputSourceMap: file.opts.inputSourceMap ?? undefined,
        }
      );
      // 提取表达式和变量，生成 class name
      if (
        !prepareStageResult ||
        !withLinariaMetadata(prepareStageResult?.metadata)
      ) {
        return;
      }

      const evalStageResult = evalStage(
        cache,
        prepareStageResult.code,
        pluginOptions,
        file.opts.filename!
      );
      // [0]: Map 存放变量计算的结果，[1]: 存放依赖
      if (evalStageResult === null) {
        return;
      }

      const [valueCache] = evalStageResult;

      const identifiers: NodePath<Identifier>[] = [];
      // 收集所有的标识符

      file.path.traverse({
        Identifier: (p) => {
          identifiers.push(p);
        },
      });

      identifiers.forEach((p) => {
        // 处理模板表达式，应该指的是那些 ${(props)=>props.color} 这种
        processTemplateExpression(p, file.opts, pluginOptions, (processor) => {
          processor.build(valueCache);
          processor.doRuntimeReplacement();
        });
      });
      // 清理 __linariaPreval 相关依赖代码
      // We can remove __linariaPreval export and all related code
      const prevalExport = (
        file.path.scope.getData('__linariaPreval') as NodePath | undefined
      )?.findParent((p) => p.isExpressionStatement());
      if (prevalExport) {
        // 这个查找关联引用方式值得学习
        removeWithRelated([prevalExport]);
      }
    },
    visitor: {},
    post(file: BabelFile) {
      debug('babel-transform:end', file.opts.filename);
    },
  };
}
