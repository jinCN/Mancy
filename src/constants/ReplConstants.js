const ReplConstants = {
  REPL_HISTORY_SIZE: 2000,
  REPL_ENCODING: 'utf8',
  TAB_WIDTH: 2,
  COMMAND_TRUNCATE_LENGTH: 80,
  OUTPUT_TRUNCATE_LENGTH: 80,
  CLJS_SEQ_TRUNCATE_LENGTH: 10,
  PROMISE: {
    PENDING: 'pending',
    RESOLVED: 'fulfilled',
    REJECTED: 'rejected'
  },
  REPL_HISTORY_SUGGESTION: 200,
  BABEL_OPTIONS: {
    'plugins': [
      'transform-es2015-classes',
      'transform-es2015-computed-properties',
      'transform-es2015-destructuring',
      'transform-es2015-for-of',
      'transform-es2015-function-name',
      'transform-es2015-object-super',
      'transform-es2015-parameters',
      'transform-es2015-sticky-regex',
      'transform-es2015-unicode-regex',
      'transform-regenerator',
      'transform-do-expressions',
      'transform-function-bind',
      'transform-class-constructor-call',
      'transform-class-properties',
      'transform-decorators',
      'transform-export-extensions',
      'syntax-trailing-function-commas',
      'transform-object-rest-spread',
      'transform-async-to-generator',
      'transform-exponentiation-operator',
      'syntax-flow',
      'syntax-jsx',
      'transform-flow-strip-types',
      'transform-react-jsx',
      'transform-runtime'
    ],
    'highlightCode': false,
    'filename': `${__dirname}/mancy-repl`,
    'env': process.env,
    'retainLines': true,
    'ast': false,
    'babelrc': false
  },
  EXEC_TIMEOUT: 60000,
  IFRAME_MAX_HEIGHT: 500,
  REPL_WATERMARK_LOGO: '>_',
  REPL_WATERMARK_MSG: 'REPL for fun 🙈'
}

export default ReplConstants
