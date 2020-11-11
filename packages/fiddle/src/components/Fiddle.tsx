import { useLocalStore, useObserver } from 'mobx-react-lite';
import React, { useRef } from 'react';
import { getQueryParam } from '../functions/get-query-param';
import MonacoEditor from 'react-monaco-editor';
import { useReaction } from '../functions/use-reaction';
import { setQueryParam } from '../functions/set-query-param';
import * as monaco from 'monaco-editor';
import logo from '../assets/jsx-lite-logo-white.png';
import {
  parseJsx,
  componentToVue,
  componentToReact,
  componentToLiquid,
} from '@jsx-lite/core';
import { MenuItem, Select, Tab, Tabs, Typography } from '@material-ui/core';
import { deleteQueryParam } from '../functions/delete-query-param';
import { TextLink } from './TextLink';
import { defaultCode, templates } from '../constants/templates';
// eslint-disable-next-line import/no-webpack-loader-syntax
import types from 'raw-loader!@jsx-lite/core/dist/jsx';
import { colors } from '../constants/colors';

const BuilderEditor: any = 'builder-editor';

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.Latest,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  esModuleInterop: true,
  jsx: monaco.languages.typescript.JsxEmit.React,
  reactNamespace: 'React',
  allowJs: true,
  typeRoots: ['node_modules/@types'],
});

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  types,
  `file:///node_modules/@react/types/index.d.ts`,
);

// TODO: Build this Fiddle app with JSX Lite :)
export default function Fiddle() {
  const state = useLocalStore(() => ({
    code: getQueryParam('code') || defaultCode,
    output: '',
    tab: getQueryParam('tab') || 'vue',
    updateOutput() {
      try {
        const json = parseJsx(state.code);
        state.output =
          state.tab === 'liquid'
            ? componentToLiquid(json)
            : state.tab === 'react'
            ? componentToReact(json)
            : state.tab === 'json' || state.tab === 'builder'
            ? JSON.stringify(json, null, 2)
            : componentToVue(json);
      } catch (err) {
        console.warn(err);
      }
    },
  }));

  const editorRef = useRef<any>();

  useReaction(
    () => state.code,
    (code) => setQueryParam('code', code),
    { fireImmediately: false },
  );
  useReaction(
    () => state.tab,
    (tab) => {
      if (state.code) {
        setQueryParam('tab', tab);
      } else {
        deleteQueryParam('tab');
      }
      state.updateOutput();
    },
  );

  useReaction(
    () => state.code,
    (code) => {
      state.updateOutput();
    },
    { delay: 1000 },
  );

  const outputMonacoEditorSize = 'calc(50vh - 140px)';

  return useObserver(() => (
    <div css={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        css={{
          display: 'flex',
          flexShrink: 0,
          alignItems: 'center',
          borderBottom: `1px solid ${colors.contrast}`,
        }}
      >
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/builderio/jsx-lite"
        >
          <img
            alt="JSX Lite Logo"
            src={logo}
            css={{
              marginLeft: 10,
              objectFit: 'contain',
              width: 200,
              height: 60,
            }}
          />
        </a>
      </div>
      <div css={{ display: 'flex', flexGrow: 1 }}>
        <div
          css={{
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${colors.contrast}`,
          }}
        >
          <div
            css={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              flexShrink: 0,
              height: 40,
              borderBottom: `1px solid ${colors.contrast}`,
            }}
          >
            <Typography
              variant="body2"
              css={{ flexGrow: 1, textAlign: 'left', opacity: 0.7 }}
            >
              Input code:
            </Typography>
            <Select
              disableUnderline
              css={{
                marginLeft: 'auto',
                marginRight: 10,
              }}
              renderValue={(value) => (
                <span css={{ textTransform: 'capitalize' }}>
                  {value === '_none' ? 'Choose template' : (value as string)}
                </span>
              )}
              defaultValue="_none"
              onChange={(e) => {
                const template = templates[e.target.value as string];
                if (template) {
                  state.code = template;
                }
              }}
            >
              <MenuItem value="_none" disabled>
                Choose template
              </MenuItem>
              {Object.keys(templates).map((key) => (
                <MenuItem
                  key={key}
                  value={key}
                  css={{
                    textTransform: 'capitalize',
                  }}
                >
                  {key}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div css={{ padding: 15, flexGrow: 1 }}>
            <MonacoEditor
              options={{
                renderLineHighlightOnlyWhenFocus: true,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollbar: { vertical: 'hidden' },
              }}
              theme="vs-dark"
              language="typescript"
              value={state.code}
              onChange={(val) => (state.code = val)}
            />
          </div>
        </div>
        <div
          css={{
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            css={{
              display: 'flex',
              alignItems: 'center',
              padding: 5,
              flexShrink: 0,
              height: 40,
              borderBottom: `1px solid ${colors.contrast}`,
            }}
          >
            <Typography
              variant="body2"
              css={{
                flexGrow: 1,
                textAlign: 'left',
                opacity: 0.7,
                paddingLeft: 10,
              }}
            >
              Output code:
            </Typography>
          </div>
          <div>
            <Tabs
              value={state.tab}
              onChange={(e, value) => (state.tab = value)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Vue" value="vue" />
              <Tab label="React" value="react" />
              <Tab label="Liquid" value="liquid" />
              <Tab label="JSON" value="json" />
            </Tabs>
            <div css={{ padding: 15 }}>
              <MonacoEditor
                height={outputMonacoEditorSize}
                options={{
                  automaticLayout: true,
                  overviewRulerBorder: false,
                  highlightActiveIndentGuide: false,
                  foldingHighlight: false,
                  renderLineHighlightOnlyWhenFocus: true,
                  occurrencesHighlight: false,
                  readOnly: true,
                  minimap: { enabled: false },
                  renderLineHighlight: 'none',
                  selectionHighlight: false,
                  scrollbar: { vertical: 'hidden' },
                }}
                theme="vs-dark"
                language={
                  state.tab === 'json' || state.tab === 'builder'
                    ? 'json'
                    : state.tab === 'react'
                    ? 'typescript'
                    : 'html'
                }
                value={state.output}
              />
            </div>
          </div>
          <div
            css={{
              borderBottom: `1px solid ${colors.contrast}`,
              borderTop: `1px solid ${colors.contrast}`,
            }}
          >
            <Typography
              variant="body2"
              css={{
                flexGrow: 1,
                textAlign: 'left',
                padding: 10,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              No-code tool interop (
              <TextLink
                target="_blank"
                href="https://github.com/builderio/builder"
              >
                Builder.io
              </TextLink>
              ):
            </Typography>
          </div>
          <div
            css={{
              flexGrow: 1,
              '& builder-editor': {
                width: '100%',
                filter: 'invert(0.88)',
                height: '100%',
              },
            }}
          >
            <BuilderEditor
              ref={editorRef}
              theme={JSON.stringify({
                colors: { primary: 'rgba(169, 104, 70, 1)' },
              })}
            />
          </div>
        </div>
      </div>
    </div>
  ));
}
